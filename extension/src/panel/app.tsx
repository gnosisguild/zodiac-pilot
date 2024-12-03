// This is the entrypoint to the panel app.
// It has access to chrome.* APIs, but it can't interact with other extensions such as MetaMask.
import { Info, PilotLogo } from '@/components'
import { ProvideExecutionRoutes } from '@/execution-routes'
import { ProvideBridgeContext } from '@/inject-bridge'
import { ProvideInjectedWallet } from '@/providers'
import { invariant } from '@epic-web/invariant'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import '../global.css'
import { pages } from './pages'
import { ProvideProvider } from './providers-ui'
import { ProvideState } from './state'
import { usePilotPort } from './usePilotPort'

const router = createHashRouter(pages)

const Root = () => {
  const { activeWindowId } = usePilotPort()

  if (activeWindowId == null) {
    return (
      <div className="relative top-32 flex h-full flex-col items-center gap-32 px-4">
        <PilotLogo />
        <Info title="Current tab is incompatible">
          Pilot is waiting to connect to a dApp. Open the dApp you want to
          simulate and Pilot will automatically connect to it.
        </Info>
      </div>
    )
  }

  return (
    <StrictMode>
      <ProvideBridgeContext windowId={activeWindowId}>
        <ProvideState>
          <ProvideExecutionRoutes>
            <ProvideInjectedWallet>
              <ProvideProvider>
                <div className="flex h-full flex-1 flex-col">
                  <RouterProvider router={router} />
                </div>

                <Toaster position="top-center" />
              </ProvideProvider>
            </ProvideInjectedWallet>
          </ProvideExecutionRoutes>
        </ProvideState>
      </ProvideBridgeContext>
    </StrictMode>
  )
}

const rootEl = document.getElementById('root')

invariant(rootEl != null, 'Could not find DOM node to attach app')

createRoot(rootEl).render(<Root />)

if (process.env.LIVE_RELOAD) {
  new EventSource(process.env.LIVE_RELOAD).addEventListener('change', (ev) => {
    const { added, removed, updated } = JSON.parse(ev.data)
    if (
      [...added, ...removed, ...updated].some((path) =>
        path.startsWith('/build/build/panel/')
      )
    ) {
      console.debug('🔄 detected change, reloading panel...')
      location.reload()
    }
  })
}
