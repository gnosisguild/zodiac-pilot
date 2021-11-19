chrome.action.onClicked.addListener((tab) => {
  // if (tab.id) {
  //   chrome.scripting.executeScript({
  //     target: { tabId: tab.id },
  //     function: () => {
  //       window.location.href = chrome.extension.getURL('index.html')
  //     },
  //   })
  // } else {
  chrome.tabs.create({ url: 'index.html' })
  // }
})

export {}
