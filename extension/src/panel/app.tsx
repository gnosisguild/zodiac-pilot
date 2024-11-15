// This is the entrypoint to the panel app.
// It has access to chrome.* APIs, but it can't interact with other extensions such as MetaMask.
import { ProvideBridgeContext } from '@/bridge'
import { ZodiacToastContainer } from '@/components'
import { ProvideInjectedWallet, ProvideProvider } from '@/providers'
import { ProvideZodiacRoutes } from '@/zodiac-routes'
import { invariant } from '@epic-web/invariant'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import { appRoutes } from './app-routes'
import './global.css'
import { ProvideState } from './state'
import { usePilotPort } from './usePilotPort'

const router = createHashRouter(appRoutes)

const Root = () => {
  const { activeWindowId } = usePilotPort()

  if (activeWindowId == null) {
    return null
  }

  return (
    <StrictMode>
      <ProvideBridgeContext windowId={activeWindowId}>
        <ProvideState>
          <ProvideZodiacRoutes>
            <ProvideInjectedWallet>
              <ProvideProvider>
                <div className="flex flex-1 flex-col">
                  <RouterProvider router={router} />
                  <ZodiacToastContainer />
                </div>
              </ProvideProvider>
            </ProvideInjectedWallet>
          </ProvideZodiacRoutes>
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
