# Zodiac Pilot Browser Extension

The Zodiac Pilot browser extension is built using the [sidepanel](https://developer.chrome.com/docs/extensions/reference/api/sidePanel) model.
It injects some code into web pages that allows it to, one the one hand, act as a wallet and record transactions, and on the other hand, connect to the user's default wallet extension for signing and executing transactions.

To achieve this we use three pillars:

- **[inject](./src/inject/)**: A script that is executed only for tracked tabs while the sidepanel is open and injects an EIP-1193 provider into the `window` object of apps to record transactions
- **[connect](./src/connect/)**: A pair of [content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) that allows the extension to connect to other wallet extensions installed in the browser.
- **[monitor](./src/monitor/)**: A [content script](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) that monitors if tabs need to reload to make sure apps properly reflect after simulated execution of recorded transactions

## Gotchas

Content scripts can access the page's DOM, but JavaScript is sandboxed from the page's execution context.
They have access to `chrome.` APIs.

To run code inside the page context we, therefore, **inject** more code from a content script into the page by dynamically creating a `script` node (see the [injectScript.ts](./src/utils/injectScript.ts) util for more info).
The scripts that are injected in this way **cannot** access `chrome` APIs anymore.
Communication between the injected code and the rest of the extension, therefore, uses `window.postMessage` and is relayed by the content script.

## Communication

As the extension needs to span multiple contexts, domains, and frames the communication of all involved parts is a bit tricky.
[This diagram](https://link.excalidraw.com/readonly/aT6I8t4LkOMXoDkbYY5Q) aims to give a full overview over which parts exist, how they are created, and how they interact with each other.
If you find a way to simplify this mechanism, please do!

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
  { activeTab: { id: 'tab-id' } }
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

### E2E tests

If you want to test a full integration you can write an E2E test using [`playwright`](https://playwright.dev/).
In our pipeline the E2E tests always point to the example application we've created.
If you want to cover more scenarios you might need to extend this application.
We've created it so that we have full control over it and don't have to adapt our tests when someone else decides to update their app.

The one thing "missing" is the real wallet of a user.
However, since this is mostly also what we want to control we've opted to mock this away so that we can test all the interactions within our code without the need to mock any of it.

#### `mockWeb3`

Call this with the `page` object of a test to initialize the `Web3Mock` and to get access to some helpers that enable you to interact with the connected wallet.

```ts
import { mockWeb3 } from '@/e2e-utils'

const {
  // Simulate that the user has locked their wallet
  lockWallet,

  // Load new or additional accounts
  loadAccounts,

  // Switch the current chain
  switchChain,
} = mockWeb3(page)
```

#### `loadExtension`

By default, you'll only have access to the example app.
To load our extension and also get access to it (so that you can navigate around and click buttons) you can use the `loadExtension` helper.

```ts
import { loadExtension } from '@/e2e-utils'

// makes sure that the extension is loaded
// and returns a handle to the extension panel
const extension = await loadExtension(page)

// use the handle to interact with the
// extension UI
await extension.getByRole('button', { name: 'Submit' }).click()
```
