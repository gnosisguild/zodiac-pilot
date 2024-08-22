// This is the entrypoint to the panel app.
// It has access to chrome.* APIs, but it can interact with other extensions such as MetaMask.
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
import { USER_WALLET_REQUEST } from '../connect/messages'

chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
  if (tabs.length === 0) throw new Error('no active tab found')
  chrome.runtime.sendMessage({
    type: PILOT_PANEL_OPENED,
    windowId: tabs[0].windowId,
    tabId: tabs[0].id,
  })
})

chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
  if (tabs.length === 0 || !tabs[0].id) throw new Error('no tab found')

  console.log('posting msg to tab', tabs[0])
  const res = await chrome.tabs.sendMessage(tabs[0].id, {
    type: USER_WALLET_REQUEST,
    request: { method: 'eth_requestAccounts', params: [] },
  })

  console.log('chainId response', res)
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
