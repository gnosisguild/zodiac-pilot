// This script will be added as a content script at document_end to pages of the extension host https://pilot.gnosisguild.org.
// It runs in the context of the extension, meaning it has access to all the chrome.* APIs.
// It cancels rendering that page and instead renders the extension page.

// make sure we have a <html lang="en"> element
const docEl = document.documentElement
while (docEl.attributes.length > 0)
  docEl.removeAttribute(docEl.attributes[0].name)
docEl.setAttribute('lang', 'en')

// Make the extension public path available to the app (read via publicPath.ts)
docEl.dataset.publicPath = chrome.runtime.getURL('/').slice(0, -1)

// clear everything and initialize Pilot app
docEl.innerHTML = `
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/png" href="${chrome.runtime.getURL(
      '/zodiac32.png'
    )}" sizes="32x32" />
    <link rel="icon" type="image/png" href="${chrome.runtime.getURL(
      '/zodiac128.png'
    )}" sizes="128x128" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Simulate dApp interactions and record transactions"
    />
    <title>Zodiac Pilot</title>
    <link rel="stylesheet" href="${chrome.runtime.getURL('/build/app.css')}" />
  </head>
  <body>
    <div id="root"></div>
  </body>
`

// now we're ready to launch the app.
// Adding it as a script node makes it run in the context of the external Zodiac Pilot host
const node = document.createElement('script')
node.src = chrome.runtime.getURL('/build/app.js')
const parent = document.head || document.documentElement
parent.appendChild(node)

// Background scripts can communicate with content scripts via chrome.runtime.sendMessage.
// Background script cannot send messages to the foreign origin window, but the content script can.
// So here we are relaying chrome.runtime to window.
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'navigationDetected') {
    window.postMessage(message, '*')
  }
})

export {}
