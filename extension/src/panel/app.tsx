// This is the entrypoint to the panel app.
// It has access to chrome.* APIs, but it can't interact with other extensions such as MetaMask.
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
import { initPort } from './port'
import { ProvideState } from './state'

initPort()

const router = createHashRouter(appRoutes)

const Root = () => {
  return (
    <StrictMode>
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
