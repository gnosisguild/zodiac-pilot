import { ProvideExtensionVersion } from '@/components'
import {
  CompanionResponseMessageType,
  PilotMessageType,
} from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import {
  createRenderFramework,
  type RenderFrameworkOptions,
} from '@zodiac/test-utils'
import type { PropsWithChildren } from 'react'
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
  version?: string

  /**
   * Routes that would be stored in the browser extension
   *
   * @default []
   */
  availableRoutes?: ExecutionRoute[]
}

export const render = async (
  path: string,
  { connected = true, version, availableRoutes = [], ...options }: Options = {},
) => {
  const renderResult = await baseRender(path, {
    ...options,
    wrapper: RenderWrapper,
    loadActions() {
      return loadRoutes(...availableRoutes)
    },
  })

  if (version != null) {
    await postMessage({
      type: CompanionResponseMessageType.PROVIDE_VERSION,
      version,
    })
  }

  if (connected) {
    await postMessage({ type: PilotMessageType.PILOT_CONNECT })
  }

  return renderResult
}

const RenderWrapper = ({ children }: PropsWithChildren) => (
  <ProvideExtensionVersion>{children}</ProvideExtensionVersion>
)
