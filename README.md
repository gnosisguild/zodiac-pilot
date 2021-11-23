# Transaction Simulator

Chrome extension to simulate dApp interactions and record transactions.

## Contribute

### Run in development

Build a development bundle of the extension in watch mode:

```
yarn dev
```

The build output is written to public/build.

To enable the extension in Chrome, follow these steps:

1. Open the Extension Management page by navigating to [chrome://extensions].
2. Enable **Developer Mode** by clicking the toggle switch at the top right of the page.
3. Click the **Load unpacked** button and select the `transaction-simulator/public` directory.

### Package for production

```
yarn build
```

TODO: figure out how to package for the Chrome extension store

## How it works

### Open dApps in iframe

For allowing arbitrary pages to be loaded in our iframe we drop `X-Frame-Options` and `Content-Security-Policy` HTTP response headers for any requests originating from the extension domain. See: [public/removeHeaders.json].

The `domains` list in the filter only includes this extension's ID.
This is crucial as must lift the cross origin restrictions only for the extension but not generally.

### Inject EIP-1193 provider

When the simulator iframe opens any page, we inject the build/inject.js script as a node into the DOM of the dApp.
This happens via a [content script](https://developer.chrome.com/docs/extensions/mv3/content_scripts/).

The injected script then runs in the context of the dApp and injects an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compatible API at `window.ethereum`.
The injected provider pretends to be a MetaMask provider, but actually forwards all EIP-1193 `request` calls to the parent extension page via `window.postMessage`.

In a similar fashion, events are bridged over the window message interface.
Whenever the a new event listener is attached to the provider in the iframe, the bridge will subscribe to the respective event in the host provider.

### Automatically connect to injected provider for dApps using Web3Modal

TODO

If the dApp does not use Web3Modal, the user will have to manually connect to MetaMask using the dApp's user interface.
Since the provider injected by the simulator disguises as MetaMask this will establish the connection.

###
