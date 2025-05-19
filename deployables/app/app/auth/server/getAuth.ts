import { getOrganization } from '@/workOS/server'
import { invariantResponse } from '@epic-web/invariant'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import type {
  AuthorizedData as WorkOsAuthorizedData,
  UnauthorizedData as WorkOsUnauthorizedData,
} from '@workos-inc/authkit-react-router/dist/cjs/interfaces'
import type { Organization } from '@workos-inc/node'
import { dbClient } from '@zodiac/db'
import type { Tenant, User } from '@zodiac/db/schema'
import { getAdminOrganizationId } from '@zodiac/env'
import { upsertTenant } from './upsertTenant'
import { upsertUser } from './upsertUser'

export type AuthorizedData = Omit<WorkOsAuthorizedData, 'user'> & {
  user: User
  tenant: Tenant
  workOsUser: WorkOsAuthorizedData['user']
  workOsOrganization: Organization
  isSystemAdmin: boolean
}

export type UnauthorizedData = Omit<WorkOsUnauthorizedData, 'user'> & {
  user: null
  tenant: null
  workOsOrganization: null
  workOsUser: WorkOsUnauthorizedData['user']
  isSystemAdmin: false
}

type AuthorizedAccessFn<Params> = (
  options: AuthorizedData & {
    request: Request
    params: Params
  },
) => boolean | Promise<boolean>

type MaybeAuthorizedAccessFn<Params> = (
  options: (AuthorizedData | UnauthorizedData) & {
    request: Request
    params: Params
  },
) => boolean | Promise<boolean>

type AuthorizedOptions<Params> = {
  ensureSignedIn: true
  hasAccess?: AuthorizedAccessFn<Params>
}

type MaybeAuthorizedOptions<Params> = {
  ensureSignedIn?: false
  hasAccess?: MaybeAuthorizedAccessFn<Params>
}

export type GetAuthOptions<Params> =
  | AuthorizedOptions<Params>
  | MaybeAuthorizedOptions<Params>

export const getAuth = <Params>(
  request: Request,
  params: Params,
  options?: GetAuthOptions<Params>,
) => {
  const { promise, resolve, reject } = Promise.withResolvers<
    AuthorizedData | UnauthorizedData
  >()

  authkitLoader(
    { request, params: {}, context: {} },
    async ({ auth }) => {
      if (auth.user == null) {
        if (options && options.hasAccess != null) {
          invariantResponse(
            options.ensureSignedIn == null || options.ensureSignedIn === false,
            'User must be signed in.',
          )

          const hasAccess = await Promise.resolve(
            options.hasAccess({
              ...auth,
              user: null,
              tenant: null,
              workOsUser: null,
              workOsOrganization: null,
              request: request.clone(),
              params,
              isSystemAdmin: false,
            }),
          )

          if (!hasAccess) {
            reject(new Response('User has no access', { status: 401 }))

            return
          }
        }

        resolve({
          ...auth,
          tenant: null,
          user: null,
          workOsUser: null,
          workOsOrganization: null,
          isSystemAdmin: false,
        })
      } else {
        const user = await upsertUser(dbClient(), auth.user)

        invariantResponse(
          auth.organizationId != null,
          'User is not logged into any organization',
        )

        const workOsOrganization = await getOrganization(auth.organizationId)
        const tenant = await upsertTenant(dbClient(), workOsOrganization)

        const isSystemAdmin = getAdminOrganizationId() === workOsOrganization.id

        if (options && options.hasAccess != null) {
          if (options.ensureSignedIn && tenant == null) {
            reject(new Response('User has no access', { status: 401 }))

            return
          }

          const hasAccess = await Promise.resolve(
            options.hasAccess({
              ...auth,
              user,
              tenant,
              workOsUser: auth.user,
              workOsOrganization,
              request: request.clone(),
              params,
              isSystemAdmin,
            }),
          )

          if (!hasAccess) {
            reject(new Response('User has no access', { status: 401 }))

            return
          }
        }

        resolve({
          ...auth,
          tenant,
          user,
          workOsUser: auth.user,
          workOsOrganization,
          isSystemAdmin,
        })
      }

      return {}
    },
    options,
  ).catch(reject)

  return promise
}
