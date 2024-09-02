// Track which tabs belong to which active Pilot sessions, so we can dynamically adjust the declarativeNetRequest rule.
// This rule removes some headers so foreign pages can be loaded in iframes.

import { Message, PILOT_CONNECT, PILOT_DISCONNECT } from '../messages'
import { activePilotSessions } from './sessionTracking'

export const startTrackingTab = (tabId: number, windowId: number) => {
  const activeSession = activePilotSessions.get(windowId)
  if (!activeSession) {
    throw new Error(`no active session found for window ${windowId}`)
  }
  activeSession.tabs.add(tabId)
  updateHeadersRule()

  // for debugging only
  chrome.action.setBadgeText({
    text: '🔴',
    tabId,
  })

  console.log('Pilot: started tracking tab', tabId, windowId)
  chrome.tabs.sendMessage(tabId, { type: PILOT_CONNECT } satisfies Message)
}

export const stopTrackingTab = (
  tabId: number,
  windowId: number,
  closed?: boolean
) => {
  console.log('stop tracking tab', tabId, windowId)
  const activeSession = activePilotSessions.get(windowId)
  if (activeSession) activeSession.tabs.delete(tabId)
  updateHeadersRule()
  console.log('Pilot: stopped tracking tab', tabId, windowId)

  // for debugging only
  chrome.action.setBadgeText({
    text: '',
    tabId,
  })

  if (!closed) {
    // avoid errors from sending messages to closed tabs
    chrome.tabs.sendMessage(tabId, { type: PILOT_DISCONNECT })
  }
}

chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  console.log('TAB ACTIVATED', tabId)
  const activePilotSession = activePilotSessions.get(windowId)

  if (activePilotSession && !activePilotSession.tabs.has(tabId)) {
    startTrackingTab(tabId, windowId)
  }
})

chrome.tabs.onRemoved.addListener((tabId, { windowId }) => {
  const activePilotSession = activePilotSessions.get(windowId)

  if (activePilotSession && activePilotSession.tabs.has(tabId)) {
    stopTrackingTab(tabId, windowId, true)
  }
})

// inject the provider script into tracked tabs whenever they start loading a new page
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  const activePilotSession = activePilotSessions.get(tab.windowId)
  const isTrackedTab = activePilotSession && activePilotSession.tabs.has(tabId)

  if (isTrackedTab && info.status === 'loading') {
    chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: ['build/inject/contentScript.js'],
      injectImmediately: true,
    })
    chrome.tabs.sendMessage(tabId, { type: PILOT_CONNECT } satisfies Message)
  }
})

// Disable CSPs for extension tabs. This is necessary to enable declarativeNetRequest REDIRECT rules for RPC interception.
// (Unfortunately, redirect targets are subject to the page's CSPs.)
// So we keep declarativeNetRequest rule in sync wth activeExtensionTabs.
// This rule removes CSP headers for extension tabs and must be kept in sync with activeExtensionTabs.
export const REMOVE_CSP_RULE_ID = 1

const updateHeadersRule = () => {
  const activeExtensionTabs = Array.from(activePilotSessions.values()).flatMap(
    (session) => Array.from(session.tabs)
  )

  // TODO removing the CSP headers alone is not enough as it does not handle apps setting CSPs via <meta http-equiv> tags in the HTML (such as Uniswap, for example)
  // see: https://github.com/w3c/webextensions/issues/169#issuecomment-1689812644
  // A potential solution could be a service worker rewriting the HTML content in the doc request to filter out these tags?
  chrome.declarativeNetRequest.updateSessionRules(
    {
      addRules:
        activeExtensionTabs.length > 0
          ? [
              {
                id: REMOVE_CSP_RULE_ID,
                priority: 1,
                action: {
                  type: chrome.declarativeNetRequest.RuleActionType
                    .MODIFY_HEADERS,
                  responseHeaders: [
                    // {
                    //   header: 'x-frame-options',
                    //   operation:
                    //     chrome.declarativeNetRequest.HeaderOperation.REMOVE,
                    // },
                    {
                      header: 'content-security-policy',
                      operation:
                        chrome.declarativeNetRequest.HeaderOperation.REMOVE,
                    },
                    {
                      header: 'content-security-policy-report-only',
                      operation:
                        chrome.declarativeNetRequest.HeaderOperation.REMOVE,
                    },
                  ],
                },
                condition: {
                  resourceTypes: [
                    chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
                    chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
                  ],
                  tabIds: Array.from(activeExtensionTabs),
                },
              },
            ]
          : [],
      removeRuleIds: [REMOVE_CSP_RULE_ID],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error('Headers rule update failed', chrome.runtime.lastError)
      } else {
        console.debug('Headers rule update successful', activeExtensionTabs)
      }
    }
  )
}
