function inject(scriptPath: string) {
  const node = document.createElement('script')
  node.type = 'text/javascript'
  node.async = false
  node.src = chrome.runtime.getURL(scriptPath)

  const parent = document.head || document.documentElement
  parent.insertBefore(node, parent.children[0])
  node.remove()
}

// prevent double injection
// (this can happen when when loading unpacked extensions)
if (document.documentElement.dataset.__zodiacPilotInjected !== 'true') {
  document.documentElement.dataset.__zodiacPilotInjected = 'true'

  inject('build/connect/injectedScript.js')
}

export {}
