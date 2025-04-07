import { ProvideExtensionVersion } from '@/components'
import type { User } from '@/db'
import { getOrganizationForUser } from '@/workOS/server'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import type {
  AuthorizedData,
  UnauthorizedData,
} from '@workos-inc/authkit-react-router/dist/cjs/interfaces'
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
import { randomUUID } from 'crypto'
import type { PropsWithChildren, Ref } from 'react'
import { data } from 'react-router'
import { afterEach, beforeEach, vi } from 'vitest'
import { default as routes } from '../app/routes'
import { loadRoutes } from './loadRoutes'
import { postMessage } from './postMessage'

const mockGetOrganizationForUser = vi.mocked(getOrganizationForUser)

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

  /**
   * Render the route in a logged in context
   */
  user?: User | null
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

const mockAuthKitLoader = vi.mocked(authkitLoader)

export const render = async (
  path: string,
  {
    connected = true,
    version = null,
    availableRoutes = [],
    activeRouteId = null,
    user = null,
    ...options
  }: Options = {},
) => {
  versionRef.current = version

  const workOsUser = mockWorkOs(user)

  mockAuthKitLoader.mockImplementation(async (loaderArgs, loaderOrOptions) => {
    const auth = createAuth(workOsUser)

    if (loaderOrOptions != null && typeof loaderOrOptions === 'function') {
      const loaderResult = await loaderOrOptions({ ...loaderArgs, auth })

      return data({ ...loaderResult, ...auth })
    }

    return data({ ...auth })
  })

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

const createAuth = (user?: AuthorizedData['user'] | null) => {
  if (user == null) {
    return {
      accessToken: null,
      entitlements: null,
      impersonator: null,
      organizationId: null,
      permissions: null,
      role: null,
      sealedSession: null,
      sessionId: null,
      user: null,
    } satisfies UnauthorizedData
  }

  return {
    accessToken: '',
    entitlements: [],
    impersonator: null,
    organizationId: '',
    permissions: [],
    role: 'admin',
    sealedSession: '',
    sessionId: '',
    user,
  } satisfies AuthorizedData
}

const mockWorkOs = (user?: User | null) => {
  if (user == null) {
    return null
  }

  mockGetOrganizationForUser.mockResolvedValue({
    allowProfilesOutsideOrganization: false,
    createdAt: user.createdAt.toISOString(),
    domains: [],
    id: randomUUID(),
    metadata: {},
    name: 'Test Org',
    object: 'organization',
    updatedAt: user.createdAt.toISOString(),
    externalId: user.tenantId,
  })

  return {
    createdAt: user.createdAt.toISOString(),
    email: 'john@doe.com',
    emailVerified: true,
    externalId: user.id,
    firstName: 'John',
    lastName: 'Doe',
    id: randomUUID(),
    lastSignInAt: null,
    metadata: {},
    object: 'user',
    profilePictureUrl: null,
    updatedAt: user.createdAt.toISOString(),
  } satisfies AuthorizedData['user']
}
