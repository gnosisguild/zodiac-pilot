// This is the entrypoint to the panel app.
// It has access to chrome.* APIs, but it can't interact with other extensions such as MetaMask.
import React, { useEffect } from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import 'react-toastify/dist/ReactToastify.css'

import './global.css'

import ProvideProvider, { useProvider } from './providers/ProvideProvider'
import { ProvideState } from './state'
import ZodiacToastContainer from '../components/Toast'
import { ProvideInjectedWallet } from './providers'
import { ProvideRoutes, RoutesEdit } from './routes'
import { useRoute, useUpdateLastUsedRoute } from './routes/routeHooks'
import Transactions from './transactions'
import { RoutesList } from './routes'
import { Message, PILOT_PANEL_CLOSED, PILOT_PANEL_OPENED } from '../messages'
import { setWindowId, update } from '../inject/bridge'
import { parsePrefixedAddress } from 'ser-kit'

let windowId: number | undefined = undefined

// notify the background script that the panel has been opened
chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
  if (tabs.length === 0) throw new Error('no active tab found')

  windowId = tabs[0].windowId
  setWindowId(tabs[0].windowId)

  chrome.runtime.sendMessage({
    type: PILOT_PANEL_OPENED,
    windowId: windowId,
    tabId: tabs[0].id,
  } satisfies Message)
})

// notify the background script once the panel is closed
window.addEventListener('beforeunload', () => {
  if (!windowId) console.error('Could not emit PILOT_PANEL_CLOSED event')
  console.log('windowId', windowId)
  chrome.runtime.sendMessage({
    type: PILOT_PANEL_CLOSED,
    windowId,
  })
})

const router = createHashRouter([
  {
    path: '/',
    element: <Transactions />,
  },
  {
    path: '/routes',
    element: <RoutesList />,
  },
  {
    path: '/routes/:routeId',
    element: <RoutesEdit />,
  },
])

const App: React.FC = () => {
  // update the last used timestamp for the current route
  useUpdateLastUsedRoute()

  // make sure the injected provider stays updated on every relevant route change
  const { route, chainId } = useRoute()
  const provider = useProvider()
  const [, avatarAddress] = parsePrefixedAddress(route.avatar)
  useEffect(() => {
    update(provider, chainId, avatarAddress)
  }, [provider, chainId, avatarAddress])

  return (
    <>
      <RouterProvider router={router} />
      <ZodiacToastContainer />
    </>
  )
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('invariant violation')
const root = createRoot(rootEl)

root.render(
  <React.StrictMode>
    <ProvideState>
      <ProvideRoutes>
        <ProvideInjectedWallet>
          <ProvideProvider>
            <App />
          </ProvideProvider>
        </ProvideInjectedWallet>
      </ProvideRoutes>
    </ProvideState>
  </React.StrictMode>
)

if (process.env.LIVE_RELOAD) {
  new EventSource(process.env.LIVE_RELOAD).addEventListener('change', (ev) => {
    const { added, removed, updated } = JSON.parse(ev.data)
    if (
      [...added, ...removed, ...updated].some((path) =>
        path.startsWith('/build/build/panel/')
      )
    ) {
      console.log('🔄 detected change, reloading panel...')
      location.reload()
    }
  })
}
