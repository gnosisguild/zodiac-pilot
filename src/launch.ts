// This script will be injected via contentScripts.ts when loading a page in a tab where the extension is activated.
// It cancels rendering that page and instead renders the extension page.

// make sure we have a <html lang="en"> element
const docEl = document.documentElement
while (docEl.attributes.length > 0)
  docEl.removeAttribute(docEl.attributes[0].name)
docEl.setAttribute('lang', 'en')

// Make the extenstion public path available to the app (read via publicPath.ts)
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
      <link rel="stylesheet" href="${chrome.runtime.getURL(
        '/build/app.css'
      )}" />
    </head>
    <body>
      <div id="root"></div>
    </body>
  `

// append Pilot app script
const node = document.createElement('script')
node.src = chrome.runtime.getURL('/build/app.js')
const parent = document.head || docEl
parent.appendChild(node)

export {}
