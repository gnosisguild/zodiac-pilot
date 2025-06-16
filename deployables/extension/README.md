# Zodiac Pilot

The Zodiac Pilot browser extension is built using the [sidepanel](https://developer.chrome.com/docs/extensions/reference/api/sidePanel) model.
It injects some code into web pages that allows it to, one the one hand, act as a wallet and record transactions, and on the other hand, connect to the user's default wallet extension for signing and executing transactions.

To achieve this we use two pillars:

- **[inject](./src/inject/)**: A script that is executed only for tracked tabs while the sidepanel is open and injects an EIP-1193 provider into the `window` object of apps to record transactions
- **[monitor](./src/monitor/)**: A [content script](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) that monitors if tabs need to reload to make sure apps properly reflect after simulated execution of recorded transactions

## Gotchas

Content scripts can access the page's DOM, but JavaScript is sandboxed from the page's execution context.
They have access to `chrome.` APIs.

To run code inside the page context we, therefore, **inject** more code from a content script into the page by dynamically creating a `script` node (see the [injectScript.ts](./src/utils/injectScript.ts) util for more info).
The scripts that are injected in this way **cannot** access `chrome` APIs anymore.
Communication between the injected code and the rest of the extension, therefore, uses `window.postMessage` and is relayed by the content script.

## Background script

### Request tracking

When we start a simulation we want to redirect requests to our own fork instead of their designated target.
However, we don't necessarily know upfront which domains to track.
To improve this situation the extension starts tracking requests as soon as it loads.
This is a pure bookkeeping exercise.
It will look at each outgoing `POST` request and inspect the body.
If the body looks like a `JSON RPC` request, we'll note down the target domain and the tab that sent the request.

### Simulation tracking

When a simulation is started the simulation tracking code makes sure that a fork is created in the currently active session.
Also, when the simulation ends we'll make sure to clear the fork on the current session.

### Session tracking

With request tracking in place we can start to actively monitor Pilot sessions.
An active Pilot session means the extension is active within a **window**.
We'll then keep track of each **tab** inside the window where the extension was opened.

When a tab is tracked by a session the extension will also execute the [inject](./src/inject/contentScript/main.ts) content script that takes over as the main provider for `window.ethereum` in all pages loaded in that tab.

#### With a fork (during simulation)

When a simulation starts a fork will be created for the currently active session.
At this time we're adding **redirect rules** for the tracked requests and ensure they go against our fork instead of their original target.
While a fork is active the session will also ensure that the redirect rules are kept up to date when new requests are tracked.

## Contribute

### Prerequisites

Copy the contents of `.env.template` into a local `.env` file.

### Overview

To run a development version of the extension:

```bash
pnpm dev
```

The build output is written to extension/public/build.
The `dev` script will watch for changes and automatically rebuild.

To enable the extension in Chrome, follow these steps:

1. Open the Extension Management page by navigating to [chrome://extensions](chrome://extensions).
2. Enable **Developer Mode** by clicking the toggle switch at the top right of the page.
3. Click the **Load unpacked** button and select the `extension/public` directory.

## Testing

There are multiple ways to test parts of this application.
Each makes different assumptions about what is the target of the test and which parts can be mocked.

### Unit tests

Unit tests can be very useful when you're dealing with bare `chrome` APIs and you want to ensure that your business logic works as expected.
We've created a couple of helpers you can find in `test-utils/chrome` that help you simulate chrome APIs.

#### `chromeMock`

This will be injected as the `chrome` global variable into tests.
You can use it, if you want to register additional handlers or to assert that certain methods have been called by the code under test.

#### `callListeners`

A utility that wraps the default `callListeners` API available on the `chromeMock`.
Since a lot of our code is async, this helper accounts for this and removes the need to add waiting code into a lot of tests.

#### `mockActiveTab`

Allows you to mock the currently active tab.
This helper also makes sure that this tab is returned by `chrome.tabs.query` and `chrome.tabs.get` helpers.

#### `mockRuntimeConnect`

Allows you to control the `port` that is returned by `chrome.runtime.connect`.
This can be useful if you want to, for instance, ensure that a message is sent on a newly created port.

#### `mockTabConnect`

Same as `mockRuntimeConnect` but for `chrome.tabs.connect`.

### Integration tests

To test more complex interactions or whole routes you can use the integration test utils.
Here, you'll be using mainly two helpers from `@/test-utils`.

#### `render`

Allows you to render a route component at a give path.
This method will also mock an active `tab` and `port` so you don't have to worry about these.
If you want to influence the properties of the active tab, you can pass them with the `activeTab` option.

```ts
import { render } from '@/test-utils'
import { RouteComponent } from './route'

// After rendering you'll get access to
// the mocked tab and port
const { mockedTab, mockedPort } = await render(
  // If you have variables in the path
  // you can pass their test values here
  '/path/variable-id',
  [
    {
      // This is where you specify under which
      // path this component is used so that variables
      // are mapped against it
      path: '/path/:id',
      Component: RouteComponent,
    },
  ],
  // You can pass any subset of attributes for a tab
  // and `render` fills in the other ones with defaults
  { activeTab: { id: 'tab-id' } },
)

// Rendering only finishes when there is actual UI visible
```

#### `renderHook`

Should you find yourself writing a more complex hook and you can't easily test it through a UI test with `render` then `renderHook` might help you.
As `render` it will create an active tab and port for you automatically.
You can control these through the `activeTab` and `port` options.
Additionally, you can simulate zodiac routes by passing them through the `routes` option

```ts
import { renderHook } from '@/test-utils'
import { useSomeHook } from './useSomeHook'

const { mockedTab, mockedPort } = await renderHook(() => useSomeHook(), {
  activeTab: { id: 'tab-id' },
  port: { name: 'port-name' },
})

// As the port can potentially change
// because multiple connect calls happened
// it is returned as a ref that will point
// to the most recent version
mockedPort.current.postMessage('Test')
```
