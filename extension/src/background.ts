// Attention: The URL must also be updated in manifest.json
const PILOT_URL = 'https://pilot.gnosisguild.org/'

// When clicking the extension button, load the current tab's page in the simulation browser
const toggle = async (tab: chrome.tabs.Tab) => {
  if (!tab.id || !tab.url) return

  if (!tab.url.startsWith(PILOT_URL)) {
    console.log('activate Zodiac Pilot')

    const url =
      tab.url.startsWith('chrome://') || tab.url.startsWith('about:')
        ? ''
        : tab.url
    chrome.tabs.update(tab.id, {
      url: `${PILOT_URL}#${encodeURIComponent(url)}`,
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
