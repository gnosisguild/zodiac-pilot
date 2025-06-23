import type {
  ExecutionRoute,
  PrefixedAddress,
  Waypoints as WaypointsType,
} from '@zodiac/schema'
import { Info, Labeled, Warning } from '@zodiac/ui'
import { getRouteId } from './getRouteId'
import { Route, Routes } from './Routes'
import { Waypoint, Waypoints } from './Waypoints'

type RouteSelectProps = {
  routes: ExecutionRoute[]
  loading?: boolean
  waypoints?: WaypointsType
  defaultValue?: string
  initiator?: PrefixedAddress
  form?: string
  name?: string
}

export const RouteSelect = ({
  routes,
  loading = false,
  defaultValue,
  initiator,
  form,
  name,
  waypoints,
}: RouteSelectProps) => {
  return (
    <Labeled label="Selected route">
      {({ inputId }) =>
        routes.length === 0 && loading === false ? (
          <>
            {initiator == null && (
              <Info title="Missing initiator">
                Once you select an initiator account you can select from all
                possible routes between the initiator and the account.
              </Info>
            )}

            {initiator != null && (
              <>
                <Warning title="Invalid route">
                  We could not find any routes between the initiator and the
                  selected account. Make you are using the correct chain.
                </Warning>

                {waypoints && (
                  <Routes disabled orientation="horizontal">
                    <Route>
                      <Waypoints>
                        {waypoints.map(({ account, ...waypoint }, index) => (
                          <Waypoint
                            key={`${account.address}-${index}`}
                            account={account}
                            connection={
                              'connection' in waypoint
                                ? waypoint.connection
                                : undefined
                            }
                          />
                        ))}
                      </Waypoints>
                    </Route>
                  </Routes>
                )}
              </>
            )}
          </>
        ) : (
          <Routes
            key={initiator}
            id={inputId}
            form={form}
            defaultValue={verifyDefaultValue(routes, defaultValue)}
          >
            {routes.map((route) => {
              const { waypoints } = route

              return (
                <Route
                  id={getRouteId(route.waypoints)}
                  key={route.id}
                  name={name}
                >
                  {waypoints && (
                    <Waypoints>
                      {waypoints.map(({ account, ...waypoint }, index) => (
                        <Waypoint
                          key={`${account.address}-${index}`}
                          account={account}
                          connection={
                            'connection' in waypoint
                              ? waypoint.connection
                              : undefined
                          }
                        />
                      ))}
                    </Waypoints>
                  )}
                </Route>
              )
            })}
          </Routes>
        )
      }
    </Labeled>
  )
}

const verifyDefaultValue = (
  routes: ExecutionRoute[],
  defaultValue?: string,
) => {
  if (defaultValue == null) {
    return defaultValue
  }

  const valueIsValid = routes.some(
    (route) => getRouteId(route.waypoints) === defaultValue,
  )

  if (valueIsValid) {
    return defaultValue
  }

  const [route] = routes

  if (route == null) {
    return
  }

  return getRouteId(route.waypoints)
}
