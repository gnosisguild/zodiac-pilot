import { CompanionAppMessageType } from '@zodiac/messages'
import { createRouteId } from '@zodiac/modules'
import { verifyPrefixedAddress, type ExecutionRoute } from '@zodiac/schema'
import { href, redirect } from 'react-router'
import { z } from 'zod'
import type { Route } from './+types/launch'

const jsonRpcValueSchema: z.ZodTypeAny = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.lazy(() => jsonRpcValueSchema)),
  z.record(z.lazy(() => jsonRpcValueSchema)),
])

const jsonRpcCallSchema = z.object({
  method: z.string().min(1, 'Method name is required'),
  params: z.array(jsonRpcValueSchema).optional().default([]),
})

// Validate the params and forward to the panel app, wrapping the prefixedAvatarAddress in a route
export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  const { accountLabel } = params
  const prefixedAvatarAddress = verifyPrefixedAddress(
    params.prefixedAvatarAddress,
  )

  const url = new URL(request.url)
  const setupParam = url.searchParams.get('setup')
  const setup = setupParam
    ? z.array(jsonRpcCallSchema).parse(JSON.parse(setupParam))
    : null

  const callbackParam = url.searchParams.get('callback')
  const callback = callbackParam ? new URL(callbackParam).toString() : null

  // Create a route with the provided avatar
  const route: ExecutionRoute = {
    id: createRouteId(),
    label: decodeURIComponent(accountLabel),
    avatar: prefixedAvatarAddress,
  }

  // Forward to extension panel via search params
  const searchParams = new URLSearchParams()
  if (callback) searchParams.set('callback', callback)
  if (setup) searchParams.set('setup', JSON.stringify(setup))
  if (route) searchParams.set('route', JSON.stringify(route))

  window.postMessage(
    {
      type: CompanionAppMessageType.OPEN_PILOT,
      search: `?${searchParams.toString()}`,
    },
    '*',
  )

  return redirect(href('/offline/tokens/balances'))
}
