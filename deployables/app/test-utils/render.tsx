import { ProvideExtensionVersion } from '@/components'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  createWindowMessageHandler,
  PilotMessageType,
} from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import {
  createRenderFramework,
  sleepTillIdle,
  type RenderFrameworkOptions,
} from '@zodiac/test-utils'
import type { PropsWithChildren, Ref } from 'react'
import { afterEach, beforeEach } from 'vitest'
import { default as routes } from '../app/routes'
import { loadRoutes } from './loadRoutes'
import { postMessage } from './postMessage'

const baseRender = await createRenderFramework(
  new URL('../app', import.meta.url),
  routes,
)

type Options = Omit<RenderFrameworkOptions, 'loadActions'> & {
  /**
   * Determines whether or not the app should render in a
   * state where it is connected to the browser extension.
   *
   * @default true
   */
  connected?: boolean

  /**
   * The version of the Pilot extension that the app should
   * simulate.
   */
  version?: string | null

  /**
   * Routes that would be stored in the browser extension
   *
   * @default []
   */
  availableRoutes?: ExecutionRoute[]

  /**
   * The route that is currently active in the browser extension
   *
   * @default undefined
   */
  activeRouteId?: string | null
}

const versionRef: Ref<string> = { current: null }

const handleVersionRequest = createWindowMessageHandler(
  CompanionAppMessageType.REQUEST_VERSION,
  () => {
    postMessage({
      type: CompanionResponseMessageType.PROVIDE_VERSION,
      version: versionRef.current ?? '0.0.0',
    })
  },
)

beforeEach(() => {
  window.addEventListener('message', handleVersionRequest)
})

afterEach(() => {
  window.removeEventListener('message', handleVersionRequest)
})

export const render = async (
  path: string,
  {
    connected = true,
    version = null,
    availableRoutes = [],
    activeRouteId = null,
    ...options
  }: Options = {},
) => {
  versionRef.current = version

  const renderResult = await baseRender(path, {
    ...options,

    wrapper: RenderWrapper,
    async loadActions() {
      await loadRoutes(...availableRoutes)

      if (activeRouteId != null) {
        await postMessage({
          type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
          activeRouteId,
        })
      }
    },
  })

  await sleepTillIdle()

  if (connected) {
    await postMessage({ type: PilotMessageType.PILOT_CONNECT })
  }

  return renderResult
}

const RenderWrapper = ({ children }: PropsWithChildren) => (
  <ProvideExtensionVersion>{children}</ProvideExtensionVersion>
)
