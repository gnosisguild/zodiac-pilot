## Things to keep in mind

### Content scripts

Can access the page's DOM, but JavaScript is sandboxed from the page's execution context. They have access to `chrome.` APIs.

There are multiple ways to register content scripts:

1. statically via `content_scripts` in manifest.json
2. dynamically via `chrome.scripting.registerContentScripts()` (supports [same properties](https://developer.chrome.com/docs/extensions/reference/api/scripting#type-RegisteredContentScript) as `content_scripts` in manifest.json)
3. dynamically via `chrome.scripting.executeScript()`

While options 1 and 2 will automatically run the content script once for every page load, option 3 just runs once at the moment `executeScript()` is invoked.
So we have to manually track when a tab loads a new page to run the content script again in the context of the new page.

We have yet to find a way that reliably lets us run `executeScript()` exactly once for every page.
At the moment we use the `chrome.tabs.onUpdated` event which can trigger multiple times per page loaded.
Thus content scripts executed in this way must handle the case that multiple instances of themselves might run in parallel.

### Injected script

Scripts that are inserted from content scripts via script nodes into the page's DOM. As such they run in the page's execution context. They have no access to `chrome.` APIs. Communicate with content scripts via `window.postMessage`.

## src folder overview

### panel

React app running in the sidePanel document. Does not have access to window.ethereum provided by the user's wallet extension.

### connect

Establish a connection to the user's wallet provided by another extension, such as MetaMask. We connect using an extra iframe we inject to every active tab. This allows us to connect to the wallet under origin `connect.pilot.gnosisguild.org`.
The communication between the injected wallet in the iframe and the Eip1193 provider in the app, goes through messages:

```
REQUEST:
panel --runtime.tabs.sendMessage()--> connect/contentScript --iframe.window.postMessage()--> connect/injectedScript

RESPONSE
connect/injectedScript --window.top.postMessage()--> connect/contentScript --runtime.tabs.sendMessage.sendResponse()--> panel
```

### inject

Override the `window.ethereum` injected provider for apps to connect to Pilot. Will only be injected to pages that are loaded while the panel is open.

Wallet requests will be relayed to the panel app through messages:

```
inject/InjectedProvider --window.top.postMessage()--> inject/contentScript --runtime.tabs.sendMessage.sendResponse()--> panel
```

### monitor

Injected only to the top-level window (not child frames windows), this content script is responsible for hinting the user about required page reload after panel toggling.

### background

The background script, handling tracking of tabs with active Pilot sessions and simulations and RPC request intercepting. There is always only a single running instance of the script across all windows.

Communication between the background script and the panel app goes exclusively through a single port.

### components

A collection of React UI components. These components implement pure, self-contained UI controls so they could eventually make up a design system.
