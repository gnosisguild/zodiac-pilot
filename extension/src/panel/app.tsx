// This is the entrypoint to the panel app.
// It has access to chrome.* APIs, but it can't interact with other extensions such as MetaMask.
import React from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import 'react-toastify/dist/ReactToastify.css'

import './global.css'

import ProvideProvider from './providers/ProvideProvider'
import { ProvideState } from './state'
import ZodiacToastContainer from '../components/Toast'
import { ProvideInjectedWallet } from './providers'
import { ProvideRoutes, RoutesEdit } from './routes'
import { useUpdateLastUsedRoute } from './routes/routeHooks'
import Transactions from './transactions'
import { RoutesList } from './routes'
import { PILOT_PANEL_OPENED } from '../messages'
import { setWindowId } from '../inject/bridge'

// notify the background script that the panel has been opened
chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
  if (tabs.length === 0) throw new Error('no active tab found')

  setWindowId(tabs[0].windowId)

  chrome.runtime.sendMessage({
    type: PILOT_PANEL_OPENED,
    windowId: tabs[0].windowId,
    tabId: tabs[0].id,
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
  useUpdateLastUsedRoute()

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
