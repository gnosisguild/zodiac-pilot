import { ProvideUser } from '@/auth-client'
import { ProvideExtensionVersion } from '@/components'
import { getOrganization, getOrganizationsForUser } from '@/workOS/server'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import type {
  AuthorizedData,
  UnauthorizedData,
} from '@workos-inc/authkit-react-router/dist/cjs/interfaces'
import type { Organization } from '@workos-inc/node'
import { activateFeatures, createFeature, dbClient } from '@zodiac/db'
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
import { FeatureProvider } from '@zodiac/ui'
import type { PropsWithChildren, Ref } from 'react'
import type { Register } from 'react-router'
import { data } from 'react-router'
import type { Entries } from 'type-fest'
import { afterEach, beforeEach, vi } from 'vitest'
import { default as routes } from '../app/routes'
import { loadRoutes } from './loadRoutes'
import { postMessage } from './postMessage'
import { createMockWorkOsOrganization, createMockWorkOsUser } from './workOS'

const mockGetOrganizationsForUser = vi.mocked(getOrganizationsForUser)
const mockGetOrganization = vi.mocked(getOrganization)
const mockGetAdminOrgId = vi.mocked(getAdminOrganizationId)

const baseRender = await createRenderFramework<Register, typeof routes>(
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

  /**
   * Activates the given set of feautres.
   */
  features?: string[]
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
    features = [],
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
    const { tenant } = options

    if (features != null) {
      const dbFeatures = await Promise.all(
        features.map(async (name) => createFeature(dbClient(), name)),
      )

      await activateFeatures(dbClient(), {
        tenantId: tenant.id,
        featureIds: dbFeatures.map(({ id }) => id),
      })
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

  const FinalWrapper = ({ children }: PropsWithChildren) => (
    <RenderWrapper user={options.user || null} features={features}>
      {children}
    </RenderWrapper>
  )

  const renderResult = await baseRender(path, {
    ...options,

    wrapper: FinalWrapper,
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

type RenderWrapperOptions = PropsWithChildren<{
  user: User | null
  features: string[]
}>

const RenderWrapper = ({ children, user, features }: RenderWrapperOptions) => (
  <ProvideExtensionVersion>
    <ProvideUser user={user}>
      <FeatureProvider features={features}>{children}</FeatureProvider>
    </ProvideUser>
  </ProvideExtensionVersion>
)

const createAuth = (user?: AuthorizedData['user'] | null) => {
  if (user == null) {
    return {
      accessToken: null,
      entitlements: null,
      impersonator: null,
      organizationId: null,
      permissions: null,
      featureFlags: null,
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
    featureFlags: [],
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
    id: tenant.externalId ?? undefined,
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

  const [firstName, ...lastNames] = user.fullName.split(' ')

  return createMockWorkOsUser({
    id: user.externalId ?? undefined,
    createdAt: user.createdAt.toISOString(),
    externalId: user.id,
    firstName,
    lastName: lastNames.join(' '),
    updatedAt: user.createdAt.toISOString(),
  })
}
