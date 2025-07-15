import { Page, useConnected } from '@/components'
import { ChainSelect } from '@/routes-ui'
import { useIsPending } from '@zodiac/hooks'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import {
  jsonStringify,
  verifyPrefixedAddress,
  type ExecutionRoute,
} from '@zodiac/schema'
import { AddressInput, InlineForm, PrimaryButton, Warning } from '@zodiac/ui'
import { splitPrefixedAddress } from 'ser-kit'
import { z } from 'zod'
import type { Route } from './+types/launch'

// this must be the same value as AD_HOC_ROUTE_ID in the extension
const AD_HOC_ROUTE_ID = 'ad-hoc'

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

function readParams({ params, request }: Omit<Route.LoaderArgs, 'context'>) {
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
    id: AD_HOC_ROUTE_ID,
    label: decodeURIComponent(accountLabel),
    avatar: prefixedAvatarAddress,
  }

  return {
    route,
    setup,
    callback,
  }
}

export const loader = async (args: Route.LoaderArgs) => {
  return readParams(args)
}

export const clientAction = async ({
  params,
  request,
}: Route.ClientActionArgs) => {
  const { callback, route, setup } = readParams({ params, request })

  // Forward to extension panel via search params
  const searchParams = new URLSearchParams()
  if (callback) searchParams.set('callback', callback)
  if (setup) searchParams.set('setup', jsonStringify(setup))
  if (route) searchParams.set('route', jsonStringify(route))
  const search = `?${searchParams.toString()}`

  // const { promise, resolve } = Promise.withResovlers()
  companionRequest(
    {
      type: CompanionAppMessageType.OPEN_PILOT,
      search,
    },
    // // TODO make this message respond after switching to the ad-hoc route and executing the setup
    // resolve
  )
  // await promise
  // return redirect('/offline/tokens/balances')
}

export default function LaunchPage({
  loaderData: { route },
}: Route.ComponentProps) {
  const isLaunching = useIsPending()

  const connected = useConnected()

  const [chainId, address] = splitPrefixedAddress(route.avatar)

  return (
    <Page>
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <ChainSelect disabled value={chainId} />
            <AddressInput
              readOnly
              value={address}
              label={route.label || 'Account'}
            />
          </div>

          {connected && !isLaunching && (
            <Warning title="Switching account">
              Launch will clear any previously recorded calls in the panel.
            </Warning>
          )}
          <InlineForm>
            <PrimaryButton submit busy={isLaunching}>
              Launch
            </PrimaryButton>
          </InlineForm>
        </div>
      </div>
    </Page>
  )
}
