import type { LoaderFunction, LoaderFunctionArgs } from 'react-router'
import {
  getAuth,
  type AuthorizedData,
  type GetAuthOptions,
  type UnauthorizedData,
} from './getAuth'

export async function authKitLoader<
  Args extends LoaderFunctionArgs,
  Fn extends LoaderFunction<{ auth: AuthorizedData }>,
>(
  args: Args,
  fn: Fn,
  options: GetAuthOptions,
): Promise<Awaited<ReturnType<typeof fn>>>
export async function authKitLoader<
  Args extends LoaderFunctionArgs,
  Fn extends LoaderFunction<{ auth: AuthorizedData | UnauthorizedData }>,
>(
  { request, params, context }: Args,
  fn: Fn,
  options?: GetAuthOptions,
): Promise<Awaited<ReturnType<typeof fn>>> {
  const auth = await getAuth(request, options)

  // @ts-expect-error type check works during usage
  return await fn({ request, params, context: { auth, ...context } })
}
