// Disable CSPs for extension tabs. This is necessary to enable declarativeNetRequest REDIRECT rules for RPC interception.
// (Unfortunately, redirect targets are subject to the page's CSPs.)
// So we keep declarativeNetRequest rule in sync wth activeExtensionTabs.

import { captureLastError } from '@/sentry'

// This rule removes CSP headers for extension tabs and must be kept in sync with activeExtensionTabs.
export const REMOVE_CSP_RULE_ID = 1

export const removeCSPHeaderRule = () => {
  const { promise, resolve } = Promise.withResolvers<void>()

  chrome.declarativeNetRequest.updateSessionRules(
    {
      removeRuleIds: [REMOVE_CSP_RULE_ID],
    },
    () => {
      captureLastError()

      if (chrome.runtime.lastError) {
        console.error('CSP rule could not be removed', chrome.runtime.lastError)
      } else {
        console.debug('CSP rule removed successfully')
      }

      resolve()
    },
  )

  return promise
}

export const updateCSPHeaderRule = (tabIds: Set<number>) => {
  const { promise, resolve } = Promise.withResolvers<void>()

  // TODO removing the CSP headers alone is not enough as it does not handle apps setting CSPs via <meta http-equiv> tags in the HTML (such as Uniswap, for example)
  // see: https://github.com/w3c/webextensions/issues/169#issuecomment-1689812644
  // A potential solution could be a service worker rewriting the HTML content in the doc request to filter out these tags?

  chrome.declarativeNetRequest.updateSessionRules(
    {
      addRules:
        tabIds.size > 0
          ? [
              {
                id: REMOVE_CSP_RULE_ID,
                priority: 1,
                action: {
                  type: chrome.declarativeNetRequest.RuleActionType
                    .MODIFY_HEADERS,
                  responseHeaders: [
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
                  tabIds: Array.from(tabIds),
                },
              },
            ]
          : [],
      removeRuleIds: [REMOVE_CSP_RULE_ID],
    },
    () => {
      captureLastError()

      if (chrome.runtime.lastError) {
        console.error('Headers rule update failed', chrome.runtime.lastError)
      } else {
        console.debug('Headers rule update successful', tabIds)
      }

      resolve()
    },
  )

  return promise
}
