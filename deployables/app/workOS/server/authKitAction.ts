import type { ActionFunction, ActionFunctionArgs } from 'react-router'
import {
  getAuth,
  type AuthorizedData,
  type GetAuthOptions,
  type UnauthorizedData,
} from './getAuth'

export async function authKitAction<
  Args extends ActionFunctionArgs,
  Fn extends ActionFunction<{ auth: AuthorizedData }>,
>(
  args: Args,
  fn: Fn,
  options?: GetAuthOptions,
): Promise<Awaited<ReturnType<typeof fn>>>
export async function authKitAction<
  Args extends ActionFunctionArgs,
  Fn extends ActionFunction<{ auth: AuthorizedData | UnauthorizedData }>,
>(
  { request, params, context }: Args,
  fn: Fn,
  options?: GetAuthOptions,
): Promise<Awaited<ReturnType<typeof fn>>> {
  const auth = await getAuth(request, options)

  // @ts-expect-error type check works during usage
  return await fn({ request, params, context: { auth, ...context } })
}
