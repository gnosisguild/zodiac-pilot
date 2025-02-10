import { Page } from '@/components'
import { invariant } from '@epic-web/invariant'
import { getStartingWaypoint, getWaypoints } from '@zodiac/modules'
import {
  verifyHexAddress,
  verifyPrefixedAddress,
  type Account,
  type ExecutionRoute,
  type Waypoint,
} from '@zodiac/schema'
import { Blockie, Info } from '@zodiac/ui'
import { MoveDown } from 'lucide-react'
import { Children, useState, type PropsWithChildren } from 'react'
import { queryRoutes } from 'ser-kit'
import type { Route } from './+types/select-route'

export const loader = async ({
  params: { fromAddress, toAddress },
}: Route.LoaderArgs) => {
  const routes = await queryRoutes(
    verifyHexAddress(fromAddress),
    verifyPrefixedAddress(toAddress),
  )

  return { routes }
}

const SelectRoute = ({ loaderData: { routes } }: Route.ComponentProps) => {
  const [selectedRoute, setSelectedRoute] = useState<ExecutionRoute | null>(
    () => {
      const [firstRoute] = routes

      if (firstRoute) {
        return firstRoute
      }

      return null
    },
  )

  if (selectedRoute == null) {
    // TODO: empty state
    return null
  }

  const probe = routes[0]

  const startingPoint = getStartingWaypoint(probe.waypoints)
  const waypoints = getWaypoints(probe)
  const endPoint = waypoints.at(-1)

  return (
    <Page fullWidth>
      <Page.Header>Select route</Page.Header>

      <main
        role="main"
        className="flex w-full flex-col gap-4 overflow-hidden pl-16"
      >
        <Waypoint account={startingPoint.account} />

        <div className="flex gap-4">
          <Route>
            <Waypoints>
              {getWaypoints(selectedRoute, { includeEnd: false }).map(
                ({ account, connection }) => (
                  <Waypoint
                    key={`${account.address}-${connection.from}`}
                    account={account}
                  />
                ),
              )}
            </Waypoints>
          </Route>

          <Routes>
            {routes.map((route) => {
              if (route === selectedRoute) {
                return null
              }

              const waypoints = getWaypoints(route, { includeEnd: false })

              return (
                <Route key={route.id}>
                  <Waypoints>
                    {waypoints.map(({ account, connection }) => (
                      <Waypoint
                        key={`${account.address}-${connection.from}`}
                        account={account}
                      />
                    ))}
                  </Waypoints>
                </Route>
              )
            })}
          </Routes>
        </div>

        {endPoint && <Waypoint account={endPoint.account} />}
      </main>
    </Page>
  )
}

export default SelectRoute

const Routes = ({ children }: PropsWithChildren) => (
  <ul className="flex w-full snap-x snap-mandatory gap-4 overflow-x-scroll pr-16">
    {children}
  </ul>
)

type RouteProps = PropsWithChildren

const Route = ({ children }: RouteProps) => {
  return <li className="snap-start list-none">{children}</li>
}

const Waypoints = ({ children }: PropsWithChildren) => {
  if (Children.count(children) === 0) {
    return (
      <div className="w-40">
        <Info>Direct connection</Info>
      </div>
    )
  }

  return (
    <ul className="flex flex-col items-center gap-4">
      {Children.map(children, (child, index) => (
        <>
          {index !== 0 && <MoveDown size={16} />}

          {child}
        </>
      ))}
    </ul>
  )
}

type WaypointProps = { account: Account }

const Waypoint = ({ account }: WaypointProps) => (
  <li className="flex w-40 flex-col items-center gap-1 rounded border border-zinc-600/75 p-2">
    <h3 className="text-xs font-semibold uppercase opacity-75">
      {account.type}
    </h3>

    <div className="flex items-center gap-2">
      <Blockie className="size-4" address={account.address} />

      <ShortAddress>{account.address}</ShortAddress>
    </div>
  </li>
)

const ShortAddress = ({ children }: { children: string }) => {
  invariant(verifyHexAddress(children), `children need to be a hex address`)

  const [, address] = children.split('x')

  return (
    <span className="font-mono text-xs uppercase">
      {`${address.slice(0, 4)}...${address.slice(address.length - 4)}`}
    </span>
  )
}
