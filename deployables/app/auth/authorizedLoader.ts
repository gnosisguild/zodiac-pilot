import type {
  LoaderFunctionArgs,
  LoaderFunction as ReactRouteRLoaderFunction,
} from 'react-router'
import {
  getAuth,
  type AuthorizedData,
  type GetAuthOptions,
  type UnauthorizedData,
} from './getAuth'

type LoaderFunction<Params, Context> = (args: {
  request: Request
  params: Params
  context: Context
}) => ReturnType<ReactRouteRLoaderFunction<Context>>

export async function authorizedLoader<
  Args extends LoaderFunctionArgs,
  Fn extends LoaderFunction<Args['params'], { auth: AuthorizedData }>,
>(
  args: Args,
  fn: Fn,
  options?: GetAuthOptions<Args['params']>,
): Promise<Awaited<ReturnType<typeof fn>>>
export async function authorizedLoader<
  Args extends LoaderFunctionArgs,
  Fn extends LoaderFunction<
    Args['params'],
    { auth: AuthorizedData | UnauthorizedData }
  >,
>(
  { request, params, context }: Args,
  fn: Fn,
  options?: GetAuthOptions<Args['params']>,
): Promise<Awaited<ReturnType<typeof fn>>> {
  const auth = await getAuth(request, params, options)

  // @ts-expect-error type check works during usage
  return await fn({ request, params, context: { auth, ...context } })
}
