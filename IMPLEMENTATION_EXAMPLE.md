# Practical Implementation Example

This document shows the exact implementation files needed to add temporary route functionality to the zodiac-pilot app while reusing existing components.

## 1. Temporary Route Hook

Create `deployables/app/app/routes-ui/useTempRoute.ts`:

```typescript
import { useCallback, useState } from 'react'
import type { ExecutionRoute, Waypoints, PrefixedAddress } from '@zodiac/schema'
import { createRouteId } from '@zodiac/modules'

type TempRoute = {
  id: string
  waypoints: Waypoints
  label?: string
  isTemporary: true
}

export const useTempRoute = () => {
  const [tempRoute, setTempRoute] = useState<TempRoute | null>(null)

  const createTempRoute = useCallback((waypoints: Waypoints, label?: string): TempRoute => {
    const route: TempRoute = {
      id: createRouteId(),
      waypoints,
      label: label || 'Temporary Route',
      isTemporary: true,
    }
    setTempRoute(route)
    return route
  }, [])

  const clearTempRoute = useCallback(() => {
    setTempRoute(null)
  }, [])

  const convertToExecutionRoute = useCallback((
    tempRoute: TempRoute, 
    avatar: PrefixedAddress, 
    initiator?: PrefixedAddress
  ): ExecutionRoute => {
    return {
      id: tempRoute.id,
      label: tempRoute.label || null,
      avatar,
      initiator,
      waypoints: tempRoute.waypoints,
    }
  }, [])

  return {
    tempRoute,
    createTempRoute,
    clearTempRoute,
    convertToExecutionRoute,
  }
}

export type { TempRoute }
```

## 2. Enhanced RouteSelect Component

Create `deployables/app/app/routes-ui/RouteSelectWithTemp.tsx`:

```typescript
import type {
  ExecutionRoute,
  PrefixedAddress,
  Waypoints as WaypointsType,
} from '@zodiac/schema'
import { Info, Labeled, Warning } from '@zodiac/ui'
import { getRouteId } from './getRouteId'
import { Route, Routes } from './Routes'
import { Waypoint, Waypoints } from './Waypoints'
import type { TempRoute } from './useTempRoute'

type RouteSelectWithTempProps = {
  routes: ExecutionRoute[]
  tempRoute?: TempRoute | null
  loading?: boolean
  waypoints?: WaypointsType
  defaultValue?: string
  initiator?: PrefixedAddress
  avatar: PrefixedAddress
  form?: string
  name?: string
  onTempRouteCreate?: (waypoints: WaypointsType) => void
  showTempRouteOption?: boolean
}

export const RouteSelectWithTemp = ({
  routes,
  tempRoute,
  loading = false,
  defaultValue,
  initiator,
  avatar,
  form,
  name,
  waypoints,
  onTempRouteCreate,
  showTempRouteOption = true,
}: RouteSelectWithTempProps) => {
  // Convert temporary route to ExecutionRoute format
  const tempExecutionRoute = tempRoute
    ? {
        id: tempRoute.id,
        label: tempRoute.label || null,
        avatar,
        initiator,
        waypoints: tempRoute.waypoints,
      } as ExecutionRoute
    : null

  // Combine persisted routes with temporary route
  const allRoutes = [
    ...routes,
    ...(tempExecutionRoute ? [tempExecutionRoute] : [])
  ]

  const handleTempRouteCreate = () => {
    if (waypoints && onTempRouteCreate) {
      onTempRouteCreate(waypoints)
    }
  }

  return (
    <Labeled label="Selected route">
      {({ inputId }) => (
        <>
          {allRoutes.length === 0 && loading === false ? (
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
                    selected account. Make sure you are using the correct chain.
                  </Warning>

                  {waypoints && showTempRouteOption && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleTempRouteCreate}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Create temporary route
                      </button>
                    </div>
                  )}

                  {waypoints && (
                    <div className="mt-4">
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
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <Routes
              key={initiator}
              id={inputId}
              form={form}
              defaultValue={verifyDefaultValue(allRoutes, defaultValue)}
            >
              {allRoutes.map((route) => {
                const { waypoints } = route
                const isTemp = tempRoute && route.id === tempRoute.id

                return (
                  <Route
                    id={getRouteId(route.waypoints)}
                    key={route.id}
                    name={name}
                  >
                    <div className="relative">
                      {isTemp && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-xs px-1 rounded text-black font-bold">
                          TEMP
                        </div>
                      )}
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
                    </div>
                  </Route>
                )
              })}
            </Routes>
          )}
        </>
      )}
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
```

## 3. Update Exports

Update `deployables/app/app/routes-ui/index.ts`:

```typescript
export { Chain } from './Chain'
export { ChainContext } from './ChainContext'
export { ChainSelect } from './ChainSelect'
export { Connection } from './Connection'
export { getRouteId } from './getRouteId'
export { Route, Routes } from './Routes'
export { RouteSelect } from './RouteSelect'
export { RouteSelectWithTemp } from './RouteSelectWithTemp'
export { useTempRoute, type TempRoute } from './useTempRoute'
export { Waypoint, Waypoints } from './Waypoints'
```

## 4. Integration in Existing Route Page

Update `deployables/app/app/routes/account/routes.tsx` to use temporary routes:

```typescript
// Add these imports at the top
import { RouteSelectWithTemp, useTempRoute } from '@/routes-ui'

// In the Routes component, add the temporary route logic:
const Routes = ({
  loaderData: {
    initiatorAddress,
    possibleInitiators,
    possibleRoutes,
    comparableId,
    routes,
    defaultRouteId,
  },
  params: { routeId, accountId },
}: Route.ComponentProps) => {
  const { formId } = useOutletContext<{ formId: string }>()
  const { tempRoute, createTempRoute, clearTempRoute } = useTempRoute()

  const handleTempRouteCreate = (waypoints: WaypointsType) => {
    createTempRoute(waypoints, 'Temporary Route')
  }

  // Get account info for avatar (you may need to add this to loader data)
  const account = { chainId: 1, address: '0x...' } // This should come from loader data

  return (
    <>
      <div
        role="tablist"
        className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-600"
      >
        <div className="flex items-center gap-2">
          {routes.map((route) => (
            <RouteTab
              key={route.id}
              route={route}
              isDefault={defaultRouteId != null && route.id === defaultRouteId}
            />
          ))}
          {tempRoute && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Temporary Route Active
            </span>
          )}
        </div>

        <AddRoute />
      </div>

      <input
        type="hidden"
        form={formId}
        name="initiator"
        value={initiatorAddress ?? ''}
      />
      <input type="hidden" form={formId} name="routeId" value={routeId ?? ''} />
      
      {/* If using temporary route, include its ID */}
      {tempRoute && (
        <input 
          type="hidden" 
          form={formId} 
          name="tempRouteId" 
          value={tempRoute.id} 
        />
      )}

      <Form method="GET">
        {({ submit }) => (
          <AddressSelect
            isClearable
            key={routeId}
            isMulti={false}
            label="Pilot Signer"
            clearLabel="Remove Pilot Signer"
            name="transient-initiator"
            placeholder="Select a wallet from the list"
            defaultValue={initiatorAddress ?? undefined}
            options={possibleInitiators}
            onChange={submit}
          />
        )}
      </Form>

      <RouteSelectWithTemp
        key={routeId}
        routes={possibleRoutes}
        tempRoute={tempRoute}
        defaultValue={comparableId}
        form={formId}
        name="serRouteId"
        avatar={prefixAddress(account.chainId, account.address)}
        initiator={
          initiatorAddress == null
            ? undefined
            : prefixAddress(undefined, initiatorAddress)
        }
        onTempRouteCreate={handleTempRouteCreate}
        showTempRouteOption={true}
      />

      {tempRoute && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-sm font-medium text-yellow-800">
                Temporary route is active
              </div>
            </div>
            <button
              type="button"
              onClick={clearTempRoute}
              className="text-sm text-yellow-600 hover:text-yellow-800 underline"
            >
              Clear temporary route
            </button>
          </div>
        </div>
      )}
    </>
  )
}
```

## 5. Usage Notes

1. **Component Reuse**: This solution reuses all existing UI components (`Routes`, `Route`, `Waypoints`, `Waypoint`) without duplication
2. **State Management**: Temporary routes are stored in React state and cleared on component unmount
3. **Visual Distinction**: Temporary routes are clearly marked with a "TEMP" badge
4. **Form Integration**: Temporary route IDs can be included in form submissions
5. **Backwards Compatibility**: Existing `RouteSelect` component continues to work unchanged

## 6. Future Enhancements

- **Persistence**: Add localStorage to persist temporary routes across page reloads
- **Conversion**: Add ability to save temporary routes as permanent routes
- **Multiple Temp Routes**: Support multiple temporary routes simultaneously
- **Route Validation**: Add validation for temporary route waypoints

This implementation provides a clean, reusable solution that integrates temporary routes into the existing architecture without duplicating significant amounts of code.