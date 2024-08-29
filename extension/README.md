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

Override the `window.ethereum` injected provider for apps to connect to Pilot. Wallet requests will be relayed to the panel app through messages:

```
inject/InjectedProvider --window.top.postMessage()--> inject/contentScript --runtime.tabs.sendMessage.sendResponse()--> panel
```

### background

The background script, handling tracking of tabs with active Pilot sessions and simulations and RPC request intercepting. There is always only a single running instance of the script across all windows.

### components

A collection of React UI components. These components implement pure, self-contained UI controls so they could eventually make up a design system.