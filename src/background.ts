// import launch from './launch'

// This is an empty page. In the future we should use a publicly hosted Zodiac Pilot URL, so pilot links become sharable.
// Users without the extension would then see the public landing page.
// Attention: The URL must also be updated in manifest.json
const PILOT_URL =
  'https://ipfs.io/ipfs/bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m'

// When clicking the extension button, load the current tab's page in the simulation browser
const toggle = async (tab: chrome.tabs.Tab) => {
  if (!tab.id || !tab.url) return

  if (!activeExtensionTabs.has(tab.id)) {
    console.log('activate Zodiac Pilot')

    chrome.tabs.update(tab.id, {
      url: `${PILOT_URL}#${encodeURIComponent(tab.url)}`,
    })
  } else {
    console.log('deactivate Zodiac Pilot')

    const url = new URL(tab.url)
    const appUrl = decodeURIComponent(url.hash.slice(1))

    await chrome.tabs.update(tab.id, {
      url: appUrl,
    })
  }
}
chrome.action.onClicked.addListener(toggle)

// Track tabs showing our extension, so we can dynamically adjust the declarativeNetRequest rule.
// This rule removes some headers so foreign pages can be loaded in iframes. We don't want to
// generally circumvent this security mechanism, so we only apply it to extension tabs.
const activeExtensionTabs = new Set<number>()

// const updateRule = () => {
//   const RULE_ID = 1
//   chrome.declarativeNetRequest.updateSessionRules({
//     // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
//     addRules:
//       activeExtensionTabs.size > 0
//         ? [
//             {
//               id: RULE_ID,
//               priority: 1,
//               action: {
//                 type: 'modifyHeaders',
//                 responseHeaders: [
//                   { header: 'x-frame-options', operation: 'remove' },
//                   { header: 'content-security-policy', operation: 'remove' },
//                 ],
//               },
//               condition: {
//                 resourceTypes: ['sub_frame'],
//                 tabIds: Array.from(activeExtensionTabs),
//               },
//             },
//           ]
//         : undefined,
//     removeRuleIds: [RULE_ID],
//   })
// }

// const executeLaunch = (tabId: number) => {
//   // run launch script
//   chrome.scripting.executeScript({
//     target: { tabId },
//     func: launch,
//     // @ts-expect-error @types/chrome is not up-to-date: available since v102
//     injectImmediately: true,
//   })
// }

// launch extension script on matching URLs
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    changeInfo.status === 'loading' &&
    tab.url?.startsWith(PILOT_URL) &&
    !activeExtensionTabs.has(tabId)
  ) {
    activeExtensionTabs.add(tabId)
    // updateRule()
  }

  if (
    changeInfo.status === 'loading' &&
    !tab.url?.startsWith(PILOT_URL) &&
    activeExtensionTabs.has(tabId)
  ) {
    activeExtensionTabs.delete(tabId)
    // updateRule()
  }

  console.log(changeInfo, tab)
  if (changeInfo.status === 'complete') {
    chrome.runtime.sendMessage({ type: 'navigationDetected' })
  }
})

export {}
