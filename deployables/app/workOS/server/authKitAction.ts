import { dbClient, getUser, type User } from '@/db'
import { invariantResponse } from '@epic-web/invariant'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import type {
  AuthorizedData as WorkOsAuthorizedData,
  UnauthorizedData as WorkOsUnauthorizedData,
} from '@workos-inc/authkit-react-router/dist/cjs/interfaces'
import type { ActionFunction, ActionFunctionArgs } from 'react-router'

type AuthorizedData = Omit<WorkOsAuthorizedData, 'user'> & {
  user: User
  workOsUser: WorkOsAuthorizedData['user']
}

type UnauthorizedData = Omit<WorkOsUnauthorizedData, 'user'> & {
  user: null
  workOsUser: WorkOsUnauthorizedData['user']
}

export const authKitAction = async <
  Args extends ActionFunctionArgs,
  Fn extends ActionFunction<{ auth: AuthorizedData | UnauthorizedData }>,
>(
  { request, params, context }: Args,
  fn: Fn,
): Promise<Awaited<ReturnType<typeof fn>>> => {
  const { promise, resolve } = Promise.withResolvers<
    AuthorizedData | UnauthorizedData
  >()

  authkitLoader({ request, params: {}, context: {} }, async ({ auth }) => {
    if (auth.user == null) {
      resolve({ ...auth, user: null, workOsUser: null })
    } else {
      invariantResponse(auth.user.externalId != null, 'User does not exist.')

      const user = await getUser(dbClient(), auth.user.externalId)

      resolve({ ...auth, user, workOsUser: auth.user })
    }

    return {}
  })

  const auth = await promise

  // @ts-expect-error type check works during usage
  return await fn({ request, params, context: { auth, ...context } })
}
