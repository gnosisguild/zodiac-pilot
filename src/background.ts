// When clicking the extension button, load the current tab's page in the simulation browser
chrome.action.onClicked.addListener(() => {
  chrome.tabs.query(
    { currentWindow: true, active: true },
    async function (tabs) {
      let tab = tabs[0]
      if (tab && tab.id && tab.url) {
        const hash =
          tab.url.startsWith('chrome:') ||
          tab.url.startsWith('chrome-extension:')
            ? ''
            : encodeURIComponent(tab.url)
        chrome.tabs.update(tab.id, {
          url: `index.html#${hash}`,
        })
      } else {
        tab = await chrome.tabs.create({ url: 'index.html' })
      }
    }
  )
})

// Track tabs showing our extension, so we can dynamically adjust the declarativeNetRequest rule.
// This rule removes some headers so foreign pages can be loaded in iframes. We don't want to
// generally circumvent this security mechanism, so we only apply it to extension tabs.
const activeExtensionTabs = new Set<number>()
const trackTab = (tab: chrome.tabs.Tab) => {
  if (!tab.id) return
  const isExtensionTab = tab.url?.startsWith(
    `chrome-extension://${chrome.runtime.id}`
  )

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

  if (isExtensionTab && !activeExtensionTabs.has(tab.id)) {
    // add to allow list
    activeExtensionTabs.add(tab.id)
    updateRule()
  }

  if (!isExtensionTab && activeExtensionTabs.has(tab.id)) {
    // remove from allow list
    activeExtensionTabs.delete(tab.id)
    updateRule()
  }
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  trackTab(tab)

  if (
    changeInfo.status === 'complete' &&
    tab.url?.startsWith(`chrome-extension://${chrome.runtime.id}`)
  ) {
    chrome.runtime.sendMessage({ type: 'navigationDetected' })
  }
})

export {}
