import { dbClient, getUser } from '@/db'
import { invariantResponse } from '@epic-web/invariant'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import type { ActionFunction, ActionFunctionArgs } from 'react-router'
import type { AuthorizedData, UnauthorizedData } from './types'

type Options = { ensureSignedIn: true }

export async function authKitAction<
  Args extends ActionFunctionArgs,
  Fn extends ActionFunction<{ auth: AuthorizedData }>,
>(args: Args, fn: Fn, options: Options): Promise<Awaited<ReturnType<typeof fn>>>
export async function authKitAction<
  Args extends ActionFunctionArgs,
  Fn extends ActionFunction<{ auth: AuthorizedData | UnauthorizedData }>,
>(
  { request, params, context }: Args,
  fn: Fn,
  options?: Options,
): Promise<Awaited<ReturnType<typeof fn>>> {
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

        resolve({ ...auth, user, workOsUser: auth.user })
      }

      return {}
    },
    options,
  ).catch(reject)

  const auth = await promise

  // @ts-expect-error type check works during usage
  return await fn({ request, params, context: { auth, ...context } })
}
