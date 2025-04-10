import type {
  ActionFunctionArgs,
  ActionFunction as ReactRouterActionFunction,
} from 'react-router'
import {
  getAuth,
  type AuthorizedData,
  type GetAuthOptions,
  type UnauthorizedData,
} from './getAuth'

type ActionFunction<Params, Context> = (args: {
  request: Request
  params: Params
  context: Context
}) => ReturnType<ReactRouterActionFunction<Context>>

export async function authorizedAction<
  Args extends ActionFunctionArgs,
  Fn extends ActionFunction<Args['params'], { auth: AuthorizedData }>,
>(
  args: Args,
  fn: Fn,
  options?: GetAuthOptions<Args['params']>,
): Promise<Awaited<ReturnType<typeof fn>>>
export async function authorizedAction<
  Args extends ActionFunctionArgs,
  Fn extends ActionFunction<
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
