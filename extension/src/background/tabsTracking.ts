// Track tabs showing our extension, so we can dynamically adjust the declarativeNetRequest rule.
// This rule removes some headers so foreign pages can be loaded in iframes. We don't want to
// generally circumvent this security mechanism, so we only apply it to extension tabs.
export const activeExtensionTabs = new Set<number>()

export const startTrackingTab = (tabId: number) => {
  if (!activeExtensionTabs.has(tabId)) {
    activeExtensionTabs.add(tabId)
    updateHeadersRule()
    console.log('Pilot: started tracking tab', tabId)
  }
}

export const stopTrackingTab = (tabId: number) => {
  if (activeExtensionTabs.has(tabId)) {
    activeExtensionTabs.delete(tabId)
    updateHeadersRule()
    console.log('Pilot: stopped tracking tab', tabId)
  }
}

// Disable CSPs for extension tabs. This is necessary to enable declarativeNetRequest REDIRECT rules for RPC interception.
// (Unfortunately, redirect targets are subject to the page's CSPs.)
// So we keep declarativeNetRequest rule in sync wth activeExtensionTabs.
// This rule removes CSP headers for extension tabs and must be kept in sync with activeExtensionTabs.
export const REMOVE_CSP_RULE_ID = 1

const updateHeadersRule = () => {
  // TODO removing the CSP headers alone is not enough as it does not handle apps setting CSPs via <meta http-equiv> tags in the HTML (such as Uniswap, for example)
  // see: https://github.com/w3c/webextensions/issues/169#issuecomment-1689812644
  // A potential solution could be a service worker rewriting the HTML content in the doc request to filter out these tags?
  chrome.declarativeNetRequest.updateSessionRules(
    {
      addRules:
        activeExtensionTabs.size > 0
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
