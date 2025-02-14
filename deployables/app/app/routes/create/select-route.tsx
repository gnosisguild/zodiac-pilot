import { Page } from '@/components'
import { invariant, invariantResponse } from '@epic-web/invariant'
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
import { Address, Form, Info, Popover, PrimaryButton } from '@zodiac/ui'
import classNames from 'classnames'
import { MoveDown } from 'lucide-react'
import {
  Children,
  useState,
  type PropsWithChildren,
  type ReactElement,
} from 'react'
import { redirect } from 'react-router'
import {
  AccountType,
  ConnectionType,
  queryRoutes,
  rankRoutes,
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

  return { routes: rankRoutes(routes) }
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
        <div className="w-44">
          <Waypoint {...startingPoint} />
        </div>

        <div className="flex">
          <div className="py-2 pr-4">
            <Route selectable={false}>
              {selectedWaypoints.length === 0 && endPoint && (
                <DirectConnection>
                  <Connection
                    account={endPoint.account}
                    connection={endPoint.connection}
                  />
                </DirectConnection>
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
                      <DirectConnection>
                        <Connection
                          account={endPoint.account}
                          connection={endPoint.connection}
                        />
                      </DirectConnection>
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
          {endPoint && (
            <div className="w-44">
              <Waypoint {...endPoint} />
            </div>
          )}

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
    <li className="flex snap-start list-none flex-col items-center">
      <button
        className={classNames(
          'flex w-44 justify-center rounded-md border py-2 outline-none',

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
    <ul className="flex flex-1 flex-col items-center gap-4">
      {Children.map(children, (child) => (
        <>
          <Connection
            account={child.props.account}
            connection={child.props.connection}
          />

          {child}
        </>
      ))}
    </ul>
  )
}

const Connection = ({
  connection,
  account,
}: {
  connection?: Connection
  account: Account
}) => {
  if (connection == null) {
    return null
  }

  if (connection && connection.type === ConnectionType.IS_MEMBER) {
    invariant(
      account.type === AccountType.ROLES,
      'IS_MEMBER connection can only be defined with a roles account',
    )

    return (
      <Popover
        popover={<Roles version={account.version} connection={connection} />}
      >
        <div className="rounded-full bg-indigo-500/20 p-1 text-indigo-600 dark:bg-teal-500/20 dark:text-teal-300">
          <MoveDown size={16} />
        </div>
      </Popover>
    )
  }

  return (
    <div className="p-1">
      <MoveDown size={16} />
    </div>
  )
}

const DirectConnection = ({ children }: PropsWithChildren) => (
  <div className="flex flex-col items-center gap-4">
    {children}

    <Info>Direct connection</Info>
  </div>
)

const Roles = ({
  connection,
  version,
}: {
  connection: Connection
  version: 1 | 2
}) => {
  if (connection.type !== ConnectionType.IS_MEMBER) {
    return null
  }

  if (version === 1) {
    return (
      <>
        <h3 className="mb-2 whitespace-nowrap text-xs font-semibold uppercase">
          Role ID
        </h3>

        <span className="whitespace-nowrap text-xs">{connection.roles[0]}</span>
      </>
    )
  }

  return (
    <>
      <h3 className="mb-2 whitespace-nowrap text-xs font-semibold uppercase">
        Possible roles
      </h3>
      <ul className="list-inside list-disc text-xs">
        {connection.roles.map((roleKey) => (
          <li key={roleKey}>{decodeRoleKey(roleKey)}</li>
        ))}
      </ul>
    </>
  )
}

type WaypointProps = { account: Account; connection?: Connection }

const Waypoint = ({ account }: WaypointProps) => (
  <li className="flex w-full flex-col items-center gap-1 rounded border border-zinc-300 bg-zinc-100 p-2 dark:border-zinc-600/75 dark:bg-zinc-950">
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
