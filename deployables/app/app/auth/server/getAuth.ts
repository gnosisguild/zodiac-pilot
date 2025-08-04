import {
  createPersonalOrganization,
  getOrganization,
  getOrganizationMemberships,
} from '@/workOS/server'
import { invariantResponse } from '@epic-web/invariant'
import {
  authkitLoader,
  getSignInUrl,
  signOut,
} from '@workos-inc/authkit-react-router'
import type {
  AuthorizedData as WorkOsAuthorizedData,
  UnauthorizedData as WorkOsUnauthorizedData,
} from '@workos-inc/authkit-react-router/dist/cjs/interfaces'
import type { Organization } from '@workos-inc/node'
import { addUserToTenant, dbClient } from '@zodiac/db'
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
    (AuthorizedData | UnauthorizedData) & { accessToken: string | null }
  >()

  authkitLoader(
    { request, params: {}, context: {} },
    async ({ auth, getAccessToken }) => {
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
          accessToken: null,
          tenant: null,
          user: null,
          workOsUser: null,
          workOsOrganization: null,
          isSystemAdmin: false,
        })
      } else {
        const workOsOrganization = await getOrganizationFromAuth(request, auth)

        const [user, tenant] = await dbClient().transaction(async (tx) => {
          const user = await upsertUser(tx, auth.user)
          const tenant = await upsertTenant(tx, user, workOsOrganization)

          await addUserToTenant(tx, tenant, user)

          return [user, tenant]
        })

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
          accessToken: getAccessToken(),
        })
      }

      return {}
    },
    options,
  ).catch(reject)

  return promise
}

const getOrganizationFromAuth = async (
  request: Request,
  auth: WorkOsAuthorizedData,
) => {
  if (auth.organizationId != null) {
    return getOrganization(auth.organizationId)
  }

  const memberships = await getOrganizationMemberships(auth.user)

  if (memberships.length === 0) {
    // This should not happen but is a safety to prevent any
    // race condition with code of the login callback which
    // should also create these orgs on demand. So, if the
    // current session doesn't mention an org, we'll check
    // for org memberships and if there are _really_ none
    // then we'll create a personal org.
    await createPersonalOrganization(auth.user)
  }

  const url = new URL(request.url)

  // even though we've just created an organization
  // the local session isn't updated and we'd create
  // more and more organizations. That's why we
  // break the flow here and force a new sign in of
  // the user. We'll redirect them back to where they
  // were but this time around they'll come back with their
  // proper organization.
  throw await signOut(request, { returnTo: await getSignInUrl(url.pathname) })
}
