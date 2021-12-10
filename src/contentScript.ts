if (window.name === 'pilot-frame') {
  const node = document.createElement('script')
  node.src = chrome.runtime.getURL('build/inject.js')

  const parent = document.head || document.documentElement
  parent.appendChild(node)
  node.onload = function () {
    node.remove()
  }
}

if (window.name === 'ganache-frame') {
  const node = document.createElement('script')
  node.src = chrome.runtime.getURL('build/ganache.js')

  const parent = document.head || document.documentElement
  parent.appendChild(node)
  node.onload = function () {
    node.remove()
  }
}

export {}
