## src folder overview

### connect

Establish a connection to the user's wallet provided by another extension, such as MetaMask. We connect using an extra iframe we inject to every active tab. This allows us to connect to the wallet under origin connect.pilot.gnosisguild.org.
The communication between the injected wallet in the iframe and the Eip1193 provider in the app, goes through messages

```
REQUEST:
app --runtime.tabs.sendMessage()--> connect/contentScript --iframe.window.postMessage()--> connect/injectedScript

RESPONSE
connect/injectedScript --window.top.postMessage()--> connect/contentScript --runtime.tabs.sendMessage.sendResponse()--> app
```

### inject

Override the `window.ethereum` injected provider for apps to connect to Pilot.
