import { Page } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import { getString } from '@zodiac/form-data'
import {
  decodeRoleKey,
  getStartingWaypoint,
  getWaypoints,
} from '@zodiac/modules'
import {
  encode,
  verifyHexAddress,
  verifyPrefixedAddress,
  type Account,
  type ExecutionRoute,
  type Waypoint,
} from '@zodiac/schema'
import { Address, Form, PrimaryButton } from '@zodiac/ui'
import classNames from 'classnames'
import { MoveDown } from 'lucide-react'
import {
  Children,
  useState,
  type PropsWithChildren,
  type ReactElement,
} from 'react'
import { redirect } from 'react-router'
import { default as Stick } from 'react-stick'
import {
  AccountType,
  ConnectionType,
  queryRoutes,
  type Connection,
} from 'ser-kit'
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

export const action = async ({
  params: { fromAddress, toAddress },
  request,
}: Route.ActionArgs) => {
  const data = await request.formData()

  const routes = await queryRoutes(
    verifyHexAddress(fromAddress),
    verifyPrefixedAddress(toAddress),
  )

  const selectedRouteId = getString(data, 'selectedRouteId')

  const selectedRoute = routes.find((route) => route.id === selectedRouteId)

  invariantResponse(
    selectedRoute != null,
    `Could not select route with id "${selectedRouteId}"`,
  )

  return redirect(`/create/finish/${encode(selectedRoute)}`)
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

  const selectedWaypoints = getWaypoints(selectedRoute, { includeEnd: false })

  const startingPoint = getStartingWaypoint(probe.waypoints)
  const waypoints = getWaypoints(probe)
  const endPoint = waypoints.at(-1)

  return (
    <Page fullWidth>
      <Page.Header>Select route</Page.Header>

      <Page.Main>
        <Waypoint {...startingPoint} />

        <div className="flex">
          <div className="py-2 pr-4">
            <Route selectable={false}>
              {selectedWaypoints.length === 0 && endPoint && (
                <Connection connection={endPoint.connection} />
              )}

              <Waypoints>
                {getWaypoints(selectedRoute, { includeEnd: false }).map(
                  ({ account, connection }) => (
                    <Waypoint
                      key={`${account.address}-${connection.from}`}
                      account={account}
                      connection={connection}
                    />
                  ),
                )}
              </Waypoints>
            </Route>
          </div>

          <div className="flex w-full snap-x snap-mandatory scroll-pl-2 overflow-x-scroll rounded-md border border-zinc-200 bg-zinc-50 px-2 py-2 dark:border-zinc-700 dark:bg-zinc-900">
            <Routes>
              {routes.map((route) => {
                const waypoints = getWaypoints(route, { includeEnd: false })

                return (
                  <Route
                    key={route.id}
                    selected={route === selectedRoute}
                    onSelect={() => setSelectedRoute(route)}
                  >
                    {waypoints.length === 0 && endPoint && (
                      <Connection connection={endPoint.connection} />
                    )}

                    <Waypoints>
                      {waypoints.map(({ account, connection }) => (
                        <Waypoint
                          key={`${account.address}-${connection.from}`}
                          account={account}
                          connection={connection}
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
          {endPoint && <Waypoint {...endPoint} />}

          <Form>
            <input
              type="hidden"
              name="selectedRouteId"
              value={selectedRoute.id}
            />

            <PrimaryButton submit>Use selected route</PrimaryButton>
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
            'cursor-pointer px-2 hover:border-indigo-500 hover:bg-indigo-500/10 focus:border-indigo-500 focus:bg-indigo-500/10 dark:hover:border-teal-500 dark:hover:bg-teal-500/10 dark:focus:border-teal-500 dark:focus:bg-teal-500/10',
          selected
            ? 'border-indigo-500 bg-indigo-500/10 dark:border-teal-500 dark:bg-teal-500/10'
            : 'border-transparent',
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

const Waypoints = ({
  children,
}: {
  children: ReactElement<WaypointProps>[]
}) => {
  if (Children.count(children) === 0) {
    return null
  }

  return (
    <ul className="flex flex-col items-center justify-around gap-4">
      {Children.map(children, (child) => (
        <>
          <Connection connection={child.props.connection} />

          {child}
        </>
      ))}
    </ul>
  )
}

const Connection = ({ connection }: { connection?: Connection }) => {
  const [hover, setHover] = useState(false)

  if (connection == null) {
    return null
  }

  return (
    <div className="flex w-40 items-center justify-center gap-1">
      <Stick
        className={classNames(
          'rounded-full p-1',
          connection &&
            connection.type === ConnectionType.IS_MEMBER &&
            'bg-teal-500/20',
        )}
        position="middle right"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        node={hover && <Roles connection={connection} />}
      >
        <MoveDown size={16} />
      </Stick>
    </div>
  )
}
const Roles = ({ connection }: { connection: Connection }) => {
  if (connection.type !== ConnectionType.IS_MEMBER) {
    return null
  }

  return (
    <ul className="text-xs font-semibold uppercase opacity-50">
      {connection.roles.map((roleKey) => (
        <li key={roleKey}>{decodeRoleKey(roleKey)}</li>
      ))}
    </ul>
  )
}

type WaypointProps = { account: Account; connection?: Connection }

const Waypoint = ({ account }: WaypointProps) => (
  <li className="flex w-40 flex-col items-center gap-1 rounded border border-zinc-300 bg-zinc-100 p-2 dark:border-zinc-600/75 dark:bg-zinc-950">
    <h3 className="text-xs font-semibold uppercase opacity-75">
      <AccountName account={account} />
    </h3>

    <Address shorten size="small">
      {account.address}
    </Address>
  </li>
)

const AccountName = ({ account }: { account: Account }) => {
  if (account.type === AccountType.ROLES) {
    return `${account.type} v${account.version}`
  }

  return account.type
}
