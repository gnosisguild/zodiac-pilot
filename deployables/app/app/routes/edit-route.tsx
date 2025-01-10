import { AvatarInput, ChainSelect, ConnectWallet } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import { executionRouteSchema, type Waypoints } from '@zodiac/schema'
import { TextInput } from '@zodiac/ui'
import { splitPrefixedAddress } from 'ser-kit'
import type { Route } from './+types/edit-route'

export const loader = ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)

  const routeData = url.searchParams.get('route')

  console.log({ routeData })

  invariantResponse(routeData != null, 'Missing "route" parameter')

  const decodedData = Buffer.from(routeData, 'base64')

  try {
    const rawJson = JSON.parse(decodedData.toString())
    const route = executionRouteSchema.parse(rawJson)

    const [chainId, avatar] = splitPrefixedAddress(route.avatar)

    return {
      id: route.id,
      label: route.label,
      chainId,
      avatar,
      pilotAddress: getPilotAddress(route.waypoints),
      providerType: route.providerType,
    }
  } catch {
    throw new Response(null, { status: 400 })
  }
}

const EditRoute = ({
  loaderData: { id, chainId, label, avatar, pilotAddress, providerType },
}: Route.ComponentProps) => {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="my-8 text-3xl font-semibold">Route configuration</h1>

      <TextInput label="Label" defaultValue={label} />
      <ChainSelect value={chainId} onChange={() => {}} />
      <ConnectWallet
        routeId={id}
        chainId={chainId}
        pilotAddress={pilotAddress}
        providerType={providerType}
        onConnect={() => {}}
        onDisconnect={() => {}}
        onError={() => {}}
      />
      <AvatarInput value={avatar} onChange={() => {}} />
    </main>
  )
}

export default EditRoute

const getPilotAddress = (waypoints?: Waypoints) => {
  if (waypoints == null) {
    return null
  }

  const [startingPoint] = waypoints

  if (startingPoint == null) {
    return null
  }

  if ('account' in startingPoint) {
    return startingPoint.account.address
  }

  return null
}
