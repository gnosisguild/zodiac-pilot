import launch from './launch'

// When clicking the extension button, load the current tab's page in the simulation browser
chrome.action.onClicked.addListener((tab) => {
  console.log('ACTION')

  if (tab?.id) {
    toggle(tab)
  }

  // chrome.tabs.query(
  //   { currentWindow: true, active: true },
  //   async function (tabs) {
  //     const tab = tabs[0]

  //     if (tab && tab.id && tab.url) {
  //       toggle(tab)
  //     } /*else {
  //       tab = await chrome.tabs.create({ url: 'index.html' })
  //       activeExtensionTabs.add(tab.id)
  //     }*/
  //   }
  // )
})

// Track tabs showing our extension, so we can dynamically adjust the declarativeNetRequest rule.
// This rule removes some headers so foreign pages can be loaded in iframes. We don't want to
// generally circumvent this security mechanism, so we only apply it to extension tabs.
const activeExtensionTabs = new Set<number>()
const tabUrls = new Map<number, string | undefined>()

const updateRule = () => {
  const RULE_ID = 1
  chrome.declarativeNetRequest.updateSessionRules({
    addRules: [
      {
        id: RULE_ID,
        priority: 1,
        action: {
          // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
          type: 'modifyHeaders',
          responseHeaders: [
            // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
            { header: 'x-frame-options', operation: 'remove' },
            // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
            { header: 'content-security-policy', operation: 'remove' },
          ],
        },
        condition: {
          // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
          resourceTypes: ['main_frame', 'sub_frame'],
          tabIds: Array.from(activeExtensionTabs),
        },
      },
    ],
    removeRuleIds: [RULE_ID],
  })
}

const executeLaunch = (tabId: number) => {
  // run launch script
  chrome.scripting.executeScript({
    target: { tabId },
    func: launch,
    // @ts-expect-error @types/chrome is not up-to-date: available since v102
    injectImmediately: true,
  })
}

const toggle = (tab: chrome.tabs.Tab) => {
  if (!tab.id) return

  if (!activeExtensionTabs.has(tab.id)) {
    console.log('activate Zodiac Pilot')

    // add to tracked list
    activeExtensionTabs.add(tab.id)
    tabUrls.set(tab.id, tab.url)

    executeLaunch(tab.id)
  } else {
    console.log('deactivate Zodiac Pilot')

    // remove from tracked list
    activeExtensionTabs.delete(tab.id)

    // reload tab to restore app page without Pilot wrapping
    chrome.tabs.reload(tab.id)
  }

  updateRule()
}

// keep Pilot open when navigating to other pages
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    changeInfo.status === 'loading' &&
    activeExtensionTabs.has(tabId) &&
    tabUrls.get(tabId) !== tab.url
  ) {
    tabUrls.set(tabId, tab.url)

    executeLaunch(tabId)
  }
})

export {}
