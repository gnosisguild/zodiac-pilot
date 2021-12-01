// When clicking the extension button, load the current tab's page in the simulation browser
chrome.action.onClicked.addListener(() => {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    const tab = tabs[0]
    if (tab && tab.id && tab.url) {
      const hash = tab.url.startsWith('chrome:')
        ? ''
        : encodeURIComponent(tab.url)
      chrome.tabs.update(tab.id, {
        url: `index.html#${hash}`,
      })
    } else {
      chrome.tabs.create({ url: 'index.html' })
    }
  })
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    changeInfo.status === 'complete' &&
    tab.url?.startsWith('chrome-extension://ccoggacobochanffcgfimdohaancehmi')
  ) {
    chrome.runtime.sendMessage({ type: 'navigationDetected' })
  }
})

export {}
