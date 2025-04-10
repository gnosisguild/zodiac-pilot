import { dbClient, getTenant, getUser, type Tenant, type User } from '@/db'
import { getOrganization } from '@/workOS/server'
import { invariantResponse } from '@epic-web/invariant'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import type {
  AuthorizedData as WorkOsAuthorizedData,
  UnauthorizedData as WorkOsUnauthorizedData,
} from '@workos-inc/authkit-react-router/dist/cjs/interfaces'
import type { Organization } from '@workos-inc/node'

export type AuthorizedData = Omit<WorkOsAuthorizedData, 'user'> & {
  user: User
  tenant: Tenant
  workOsUser: WorkOsAuthorizedData['user']
  workOsOrganization: Organization
}

export type UnauthorizedData = Omit<WorkOsUnauthorizedData, 'user'> & {
  user: null
  tenant: null
  workOsOrganization: null
  workOsUser: WorkOsUnauthorizedData['user']
}

type AccessFn<Params> = (options: {
  user: User
  tenant: Tenant
  request: Request
  params: Params
}) => boolean | Promise<boolean>

export type GetAuthOptions<Params> = {
  ensureSignedIn: true
  hasAccess?: AccessFn<Params>
}

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
        resolve({
          ...auth,
          tenant: null,
          user: null,
          workOsUser: null,
          workOsOrganization: null,
        })
      } else {
        invariantResponse(auth.user.externalId != null, 'User does not exist.')

        const user = await getUser(dbClient(), auth.user.externalId)

        invariantResponse(
          auth.organizationId != null,
          'User is not logged into any organization',
        )

        const workOsOrganization = await getOrganization(auth.organizationId)

        const tenant = await getTenant(
          dbClient(),
          workOsOrganization.externalId,
        )

        if (options && options.hasAccess != null) {
          invariantResponse(
            await Promise.resolve(
              options.hasAccess({
                user,
                tenant,
                request: request.clone(),
                params,
              }),
            ),
            'User has no access',
            {
              status: 401,
            },
          )
        }

        resolve({
          ...auth,
          tenant,
          user,
          workOsUser: auth.user,
          workOsOrganization,
        })
      }

      return {}
    },
    options,
  ).catch(reject)

  return promise
}
