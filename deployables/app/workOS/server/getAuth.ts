import { dbClient, getUser, type User } from '@/db'
import { invariantResponse } from '@epic-web/invariant'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import type {
  AuthorizedData as WorkOsAuthorizedData,
  UnauthorizedData as WorkOsUnauthorizedData,
} from '@workos-inc/authkit-react-router/dist/cjs/interfaces'

export type AuthorizedData = Omit<WorkOsAuthorizedData, 'user'> & {
  user: User
  workOsUser: WorkOsAuthorizedData['user']
}

export type UnauthorizedData = Omit<WorkOsUnauthorizedData, 'user'> & {
  user: null
  workOsUser: WorkOsUnauthorizedData['user']
}

type AccessFn<Params> = (options: {
  user: User
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
        resolve({ ...auth, user: null, workOsUser: null })
      } else {
        invariantResponse(auth.user.externalId != null, 'User does not exist.')

        const user = await getUser(dbClient(), auth.user.externalId)

        if (options && options.hasAccess != null) {
          invariantResponse(
            await Promise.resolve(
              options.hasAccess({ user, request: request.clone(), params }),
            ),
            'User has no access',
            {
              status: 401,
            },
          )
        }

        resolve({ ...auth, user, workOsUser: auth.user })
      }

      return {}
    },
    options,
  ).catch(reject)

  return promise
}
