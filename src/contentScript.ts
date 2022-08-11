function inject(windowName: string, scriptPath: string) {
  if (window.name === windowName) {
    const node = document.createElement('script')
    node.src = chrome.runtime.getURL(scriptPath)

    const parent = document.head || document.documentElement
    parent.appendChild(node)
    node.onload = function () {
      node.remove()
    }
  }
}

inject('pilot-frame', 'build/inject/pilot.js')
inject('ganache-frame', 'build/inject/ganache.js')
inject('metamask-frame', 'build/inject/metamask.js')

export {}
