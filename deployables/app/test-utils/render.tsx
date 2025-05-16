import { ProvideExtensionVersion } from '@/components'
import { getOrganization, getOrganizationsForUser } from '@/workOS/server'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import type {
  AuthorizedData,
  UnauthorizedData,
} from '@workos-inc/authkit-react-router/dist/cjs/interfaces'
import type { Organization } from '@workos-inc/node'
import { activateFeature, createFeature, dbClient } from '@zodiac/db'
import type { Tenant, User } from '@zodiac/db/schema'
import { getAdminOrganizationId } from '@zodiac/env'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  createWindowMessageHandler,
  PilotMessageType,
  type RequestResponseTypes,
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
import type { Entries } from 'type-fest'
import { afterEach, beforeEach, vi } from 'vitest'
import { default as routes } from '../app/routes'
import { createMockWorkOsOrganization } from './createMockWorkOsOrganization'
import { loadRoutes } from './loadRoutes'
import { postMessage } from './postMessage'

const mockGetOrganizationsForUser = vi.mocked(getOrganizationsForUser)
const mockGetOrganization = vi.mocked(getOrganization)
const mockGetAdminOrgId = vi.mocked(getAdminOrganizationId)

const baseRender = await createRenderFramework(
  new URL('../app', import.meta.url),
  routes,
)

type CommonOptions = Omit<RenderFrameworkOptions, 'loadActions'> & {
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
   * Sets up listeners for certain companion app message events
   * and automatically responds with the provided data
   */
  autoRespond?: Partial<RequestResponseTypes>
}

type SignedInOptions = CommonOptions & {
  /**
   * Render the route in a logged in context
   */
  tenant: Tenant

  /**
   * Render the route in a logged in context
   */
  user: User

  /**
   * Activates the given set of feautres for a tenant.
   */
  features?: string[]

  /**
   * Stub for the work OS organization that should
   * belong to the tenant
   */
  workOsOrganization?: Partial<Organization>

  /** Setup org in a way that user is considered a system admin */
  isSystemAdmin?: boolean
}

type SignedOutOptions = CommonOptions & {
  tenant?: null
  user?: null
  workOsOrganization?: null
  isSystemAdmin?: false
}

type Options = SignedInOptions | SignedOutOptions

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

type AnyFn = (...args: any[]) => void

const activeHandlers: Ref<AnyFn[]> = { current: [] }

beforeEach(() => {
  activeHandlers.current = []

  window.addEventListener('message', handleVersionRequest)
})

afterEach(() => {
  activeHandlers.current?.forEach((handler) => {
    window.removeEventListener('message', handler)
  })

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
    autoRespond = {},
    ...options
  }: Options = {},
) => {
  versionRef.current = version

  const workOsUser = mockWorkOs(options)

  mockAuthKitLoader.mockImplementation(async (loaderArgs, loaderOrOptions) => {
    const auth = createAuth(workOsUser)

    if (loaderOrOptions != null && typeof loaderOrOptions === 'function') {
      const loaderResult = await loaderOrOptions({ ...loaderArgs, auth })

      return data({ ...loaderResult, ...auth })
    }

    return data({ ...auth })
  })

  if (options.tenant != null) {
    const { tenant, features } = options

    if (features != null) {
      await Promise.all(
        features.map(async (name) => {
          const feature = await createFeature(dbClient(), name)
          await activateFeature(dbClient(), {
            tenantId: tenant.id,
            featureId: feature.id,
          })
        }),
      )
    }
  }

  ;(Object.entries(autoRespond) as Entries<RequestResponseTypes>).map(
    ([request, data]) => {
      const handleRequest = createWindowMessageHandler(request, () => {
        // @ts-expect-error the type is a bit too borad but that is fine
        postMessage(data)
      })

      activeHandlers.current?.push(handleRequest)

      window.addEventListener('message', handleRequest)
    },
  )

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

  await renderResult.waitForPendingLoaders()

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

type MockWorkOsOptions = {
  tenant?: Tenant | null
  user?: User | null
  workOsOrganization?: Partial<Organization> | null
  isSystemAdmin?: boolean
}

const mockWorkOs = ({
  tenant,
  user,
  workOsOrganization,
  isSystemAdmin = false,
}: MockWorkOsOptions) => {
  if (user == null || tenant == null) {
    return null
  }

  const mockOrganization = createMockWorkOsOrganization({
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.createdAt.toISOString(),
    externalId: tenant.id,

    ...workOsOrganization,
  })

  if (isSystemAdmin) {
    mockGetAdminOrgId.mockReturnValue(mockOrganization.id)
  }

  mockGetOrganizationsForUser.mockResolvedValue([mockOrganization])
  mockGetOrganization.mockResolvedValue(mockOrganization)

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
