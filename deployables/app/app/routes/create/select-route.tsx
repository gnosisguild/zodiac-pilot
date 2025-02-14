import { Page } from '@/components'
import {
  Connection,
  DirectConnection,
  Route,
  Waypoint,
  Waypoints,
} from '@/routes-ui'
import { invariantResponse } from '@epic-web/invariant'
import { getString } from '@zodiac/form-data'
import { getStartingWaypoint, getWaypoints } from '@zodiac/modules'
import {
  encode,
  verifyHexAddress,
  verifyPrefixedAddress,
  type ExecutionRoute,
} from '@zodiac/schema'
import { Form, PrimaryButton } from '@zodiac/ui'
import { useState } from 'react'
import { redirect, Routes } from 'react-router'
import { queryRoutes, rankRoutes } from 'ser-kit'
import type { Route as RouteType } from './+types/select-route'

export const loader = async ({
  params: { fromAddress, toAddress },
}: RouteType.LoaderArgs) => {
  const routes = await queryRoutes(
    verifyHexAddress(fromAddress),
    verifyPrefixedAddress(toAddress),
  )

  return { routes: rankRoutes(routes) }
}

export const action = async ({
  params: { fromAddress, toAddress },
  request,
}: RouteType.ActionArgs) => {
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

  return redirect(`/edit-route/${encode(selectedRoute)}`)
}

const SelectRoute = ({ loaderData: { routes } }: RouteType.ComponentProps) => {
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
