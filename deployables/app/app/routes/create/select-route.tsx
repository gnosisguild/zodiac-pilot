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
import { Blockie, Form, Info, PrimaryButton } from '@zodiac/ui'
import classNames from 'classnames'
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

      <Page.Main>
        <Waypoint account={startingPoint.account} />

        <div className="flex">
          <div className="py-2 pr-4">
            <Route selectable={false}>
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
          </div>

          <div className="flex w-full snap-x snap-mandatory scroll-pl-2 overflow-x-scroll rounded-md border border-zinc-700 bg-zinc-900 px-2 py-2">
            <Routes>
              {routes.map((route) => {
                const waypoints = getWaypoints(route, { includeEnd: false })

                return (
                  <Route
                    key={route.id}
                    selected={route === selectedRoute}
                    onSelect={() => setSelectedRoute(route)}
                  >
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
        </div>

        <div className="flex justify-between">
          {endPoint && <Waypoint account={endPoint.account} />}

          <Form>
            <input
              type="hidden"
              name="selectedRouteId"
              value={selectedRoute.id}
            />

            <PrimaryButton>Use selected route</PrimaryButton>
          </Form>
        </div>
      </Page.Main>
    </Page>
  )
}

export default SelectRoute

const Routes = ({ children }: PropsWithChildren) => (
  <ul className="flex gap-1">{children}</ul>
)

type RouteProps = PropsWithChildren<{
  selectable?: boolean
  selected?: boolean
  onSelect?: () => void
}>

const Route = ({
  children,
  selected = false,
  selectable = true,
  onSelect,
}: RouteProps) => {
  return (
    <li className="snap-start list-none">
      <button
        className={classNames(
          'rounded-md border py-2 outline-none',

          selectable &&
            'cursor-pointer px-2 hover:border-teal-500 hover:bg-teal-500/10 focus:border-teal-500 focus:bg-teal-500/10',
          selected ? 'border-teal-500 bg-teal-500/10' : 'border-transparent',
        )}
        onClick={() => {
          if (selectable === false) {
            return
          }

          if (onSelect != null) {
            onSelect()
          }
        }}
      >
        {children}
      </button>
    </li>
  )
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
    <ul className="flex flex-col items-center justify-around gap-4">
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
  <li className="flex w-40 flex-col items-center gap-1 rounded border border-zinc-600/75 bg-zinc-950 p-2">
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
