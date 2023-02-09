// Attention: The URL must also be updated in manifest.json
const PILOT_URL = 'https://pilot.gnosisguild.org/'

// Track tabs showing our extension, so we can dynamically adjust the declarativeNetRequest rule.
// This rule removes some headers so foreign pages can be loaded in iframes. We don't want to
// generally circumvent this security mechanism, so we only apply it to extension tabs.
const activeExtensionTabs = new Set<number>()

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
            { header: 'X-Frame-Options', operation: 'remove' },
            // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
            { header: 'content-security-policy', operation: 'remove' },
          ],
        },
        condition: {
          // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
          resourceTypes: ['sub_frame'],
          tabIds: Array.from(activeExtensionTabs),
        },
      },
    ],
    removeRuleIds: [RULE_ID],
  })
}

// When clicking the extension button, load the current tab's page in the simulation browser
const toggle = async (tab: chrome.tabs.Tab) => {
  if (!tab.id || !tab.url) return

  if (!tab.url.startsWith(PILOT_URL)) {
    console.log('activate Zodiac Pilot')

    // add to tracked list
    activeExtensionTabs.add(tab.id)

    const url =
      tab.url.startsWith('chrome://') || tab.url.startsWith('about:')
        ? ''
        : tab.url
    chrome.tabs.update(tab.id, {
      url: `${PILOT_URL}#${encodeURIComponent(url)}`,
    })
  } else {
    console.log('deactivate Zodiac Pilot')

    // remove from tracked list
    activeExtensionTabs.delete(tab.id)

    const url = new URL(tab.url)
    const appUrl = decodeURIComponent(url.hash.slice(1))

    await chrome.tabs.update(tab.id, {
      url: appUrl,
    })
  }
}
chrome.action.onClicked.addListener(toggle)

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  const isExtensionTab = !!tab.url?.startsWith(PILOT_URL)
  const wasExtensionTab = activeExtensionTabs.has(tabId)

  if (isExtensionTab && !wasExtensionTab) {
    activeExtensionTabs.add(tabId)
    updateRule()
  }
  if (!isExtensionTab && wasExtensionTab) {
    activeExtensionTabs.delete(tabId)
    updateRule()
  }

  if (changeInfo.status === 'complete' && isExtensionTab) {
    chrome.tabs.sendMessage(tabId, { type: 'navigationDetected' })
  }
})

export {}
