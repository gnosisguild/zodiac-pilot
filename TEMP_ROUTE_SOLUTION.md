# Temporary Route Implementation - Reusing Existing Components

## Overview

This solution implements temporary route functionality while maximizing reuse of existing UI components and minimizing code duplication. The approach focuses on extending the current `RouteSelect` component and related infrastructure to handle temporary routes alongside persisted ones.

## Current Architecture Analysis

The existing codebase has a well-structured route system:

- **Storage Layer**: Database-backed routes via `createRoute`, `getRoute`, `getRoutes` in `packages/db/src/access/routes/`
- **Schema**: `ExecutionRoute` and `Waypoints` types in `packages/schema/src/routeSchema.ts`
- **UI Components**: Reusable components in `deployables/app/app/routes-ui/`
  - `Routes` and `Route` - Base routing UI components
  - `RouteSelect` - Main route selection interface
  - `Waypoints` and `Waypoint` - Route visualization components
- **Integration**: Routes displayed via `RouteSelect` in various parts of the app

## Solution Architecture

### 1. Temporary Route Hook

Create a hook that manages temporary route state and integrates with existing infrastructure:

```typescript
// deployables/app/app/routes-ui/useTempRoute.ts
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

### 2. Enhanced RouteSelect Component

Extend the existing `RouteSelect` component to handle temporary routes without duplicating UI code:

```typescript
// deployables/app/app/routes-ui/RouteSelectWithTemp.tsx
import type {
  ExecutionRoute,
  PrefixedAddress,
  Waypoints as WaypointsType,
} from '@zodiac/schema'
import { Info, Labeled, Warning } from '@zodiac/ui'
import { getRouteId } from './getRouteId'
import { Route, Routes } from './Routes'
import { Waypoint, Waypoints } from './Waypoints'
import { useTempRoute, type TempRoute } from './useTempRoute'

type RouteSelectWithTempProps = {
  routes: ExecutionRoute[]
  tempRoute?: TempRoute
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
  const { convertToExecutionRoute } = useTempRoute()

  // Combine persisted routes with temporary route
  const allRoutes = [
    ...routes,
    ...(tempRoute ? [convertToExecutionRoute(tempRoute, avatar, initiator)] : [])
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
                    selected account. Make you are using the correct chain.
                  </Warning>

                  {waypoints && showTempRouteOption && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleTempRouteCreate}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Create temporary route
                      </button>
                    </div>
                  )}

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
              defaultValue={verifyDefaultValue(allRoutes, defaultValue)}
            >
              {allRoutes.map((route) => {
                const { waypoints } = route
                const isTemp = 'isTemporary' in route

                return (
                  <Route
                    id={getRouteId(route.waypoints)}
                    key={route.id}
                    name={name}
                  >
                    <div className="relative">
                      {isTemp && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-xs px-1 rounded text-black">
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

### 3. Integration Example

Here's how to integrate temporary routes into existing route pages:

```typescript
// Example: Enhanced routes.tsx
import { RouteSelectWithTemp } from '@/routes-ui/RouteSelectWithTemp'
import { useTempRoute } from '@/routes-ui/useTempRoute'

const Routes = ({ loaderData, params }: Route.ComponentProps) => {
  const { tempRoute, createTempRoute, clearTempRoute } = useTempRoute()
  const { 
    possibleRoutes, 
    initiatorAddress, 
    comparableId,
    // ... other loader data 
  } = loaderData

  const handleTempRouteCreate = (waypoints: Waypoints) => {
    createTempRoute(waypoints, 'Temporary Route')
  }

  return (
    <div>
      {/* ... existing UI ... */}
      
      <RouteSelectWithTemp
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
        <div className="mt-4">
          <button
            type="button"
            onClick={clearTempRoute}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Clear temporary route
          </button>
        </div>
      )}
    </div>
  )
}
```

## Key Benefits

1. **Component Reuse**: Leverages existing `Routes`, `Route`, `Waypoints`, and `Waypoint` components
2. **Minimal Code Duplication**: Only adds temporary route logic, not new UI components
3. **Type Safety**: Uses existing `ExecutionRoute` and `Waypoints` types
4. **Incremental Adoption**: Can be applied selectively to specific pages
5. **Clear Visual Distinction**: Temporary routes are visually marked
6. **Backwards Compatible**: Existing code continues to work unchanged

## Implementation Strategy

1. **Phase 1**: Create the `useTempRoute` hook
2. **Phase 2**: Create `RouteSelectWithTemp` component
3. **Phase 3**: Update specific pages to use temporary route functionality
4. **Phase 4**: Add persistence options (save temporary route as permanent)

## Files to Modify/Create

- `deployables/app/app/routes-ui/useTempRoute.ts` (new)
- `deployables/app/app/routes-ui/RouteSelectWithTemp.tsx` (new) 
- `deployables/app/app/routes-ui/index.ts` (update exports)
- Update specific route pages as needed (e.g., `routes/account/routes.tsx`)

This approach provides a clean, reusable solution that integrates temporary routes into the existing architecture without duplicating significant amounts of code.