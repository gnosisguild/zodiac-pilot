// When clicking the extension button, load the current tab's page in the simulation browser
chrome.action.onClicked.addListener((tab) => {
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

export {}
