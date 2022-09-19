// This is an empty page. In the future we should use a publicly hosted Zodiac Pilot URL, so pilot links become sharable.
// Users without the extension would then see the public landing page.
// Attention: The URL must also be updated in manifest.json
const PILOT_URL =
  'https://ipfs.io/ipfs/bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m'

// When clicking the extension button, load the current tab's page in the simulation browser
const toggle = async (tab: chrome.tabs.Tab) => {
  if (!tab.id || !tab.url) return

  if (!tab.url.startsWith(PILOT_URL)) {
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

// launch extension script on matching URLs
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { type: 'navigationDetected' })
  }
})

export {}