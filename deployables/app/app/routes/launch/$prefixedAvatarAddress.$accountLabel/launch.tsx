import { Page, useConnected } from '@/components'
import { ChainSelect } from '@/routes-ui'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import {
  jsonStringify,
  verifyPrefixedAddress,
  type ExecutionRoute,
} from '@zodiac/schema'
import { AddressInput, PrimaryButton, Warning } from '@zodiac/ui'
import { useState } from 'react'
import { splitPrefixedAddress } from 'ser-kit'
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

export async function loader({ params, request }: Route.LoaderArgs) {
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
    id: 'ad-hoc',
    label: decodeURIComponent(accountLabel),
    avatar: prefixedAvatarAddress,
  }

  return {
    route,
    setup,
    callback,
    prefixedAvatarAddress,
  }
}

export default function LaunchPage({
  loaderData: { route, callback, setup },
}: Route.ComponentProps) {
  const [launching, setLaunching] = useState(false)

  // Forward to extension panel via search params
  const searchParams = new URLSearchParams()
  if (callback) searchParams.set('callback', callback)
  if (setup) searchParams.set('setup', jsonStringify(setup))
  if (route) searchParams.set('route', jsonStringify(route))
  const search = `?${searchParams.toString()}`

  const connected = useConnected()

  const openPilot = async () => {
    setLaunching(true)
    companionRequest(
      {
        type: CompanionAppMessageType.OPEN_PILOT,
        search,
      },
      // // TODO make this message respond after switching to the ad-hoc route and executing the setup
      // () => {
      //   // Then continue here with redirecting to the token balances page
      //   // navigate('/offline/tokens/balances')
      // },
    )

    setLaunching(false)
  }

  const [chainId, address] = splitPrefixedAddress(route.avatar)

  return (
    <Page>
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <ChainSelect disabled defaultValue={chainId} />
            <AddressInput
              readOnly
              value={address}
              label={route.label || 'Account'}
            />
          </div>

          {connected && !launching && (
            <Warning title="Switching account">
              Launch will clear any previously recorded calls in the panel.
            </Warning>
          )}
          <PrimaryButton onClick={openPilot} busy={launching}>
            Launch
          </PrimaryButton>
        </div>
      </div>
    </Page>
  )
}
