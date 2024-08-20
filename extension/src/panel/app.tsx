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
import { ProvideMetaMask } from './providers'
import { ProvideRoutes, RoutesEdit } from './routes'
import { useUpdateLastUsedRoute } from './routes/routeHooks'
import Transactions from './transactions'
import { RoutesList } from './routes'

console.log('win', window, window.ethereum)

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
        <ProvideMetaMask>
          <ProvideProvider>
            <App />
          </ProvideProvider>
        </ProvideMetaMask>
      </ProvideRoutes>
    </ProvideState>
  </React.StrictMode>
)
