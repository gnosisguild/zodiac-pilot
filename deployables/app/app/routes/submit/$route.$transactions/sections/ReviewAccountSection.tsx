import { ChainSelect, Route, Routes, Waypoint, Waypoints } from '@/routes-ui'

import { Collapsable, Error, Labeled, NumberInput, Warning } from '@zodiac/ui'

import type { ChainId, StartingPoint, Waypoint as WaypointType } from 'ser-kit'

export type SafeOwnerWaypoint = WaypointType & { defaultNonce: number }

type ReviewAccountSectionProps = {
  id: string
  isValidRoute: boolean
  hasQueryRoutesError: boolean
  chainId: ChainId
  waypoints: [StartingPoint, ...WaypointType[]]
  safeOwnerWaypoints: SafeOwnerWaypoint[]
}

export function ReviewAccountSection({
  id,
  isValidRoute,
  hasQueryRoutesError,
  chainId,
  waypoints,
  safeOwnerWaypoints,
}: ReviewAccountSectionProps) {
  return (
    <>
      {!isValidRoute && (
        <Error title="Unknown route">
          The selected execution route appears invalid. Proceed with caution.
        </Error>
      )}

      {hasQueryRoutesError && (
        <Warning title="Route validation unavailable">
          The selected execution route could not be validated. Proceed with
          caution.
        </Warning>
      )}

      <ChainSelect disabled defaultValue={chainId} />

      <Labeled label="Execution route">
        <Routes disabled orientation="horizontal">
          <Route id={id}>
            {waypoints && (
              <Waypoints>
                {waypoints.map(({ account, ...waypoint }, index) => (
                  <Waypoint
                    key={`${account.address}-${index}`}
                    account={account}
                    connection={
                      'connection' in waypoint ? waypoint.connection : undefined
                    }
                  />
                ))}
              </Waypoints>
            )}
          </Route>
        </Routes>
      </Labeled>
      <div className="flex flex-col gap-4">
        <Collapsable title="Define custom Safe transaction nonce">
          {safeOwnerWaypoints.map((wp) => (
            <div
              key={wp.account.prefixedAddress}
              className="flex flex-col items-end gap-4 md:flex-row"
            >
              <div className="w-full md:w-1/3">
                <Waypoint
                  account={wp.account}
                  connection={'connection' in wp ? wp.connection : undefined}
                />
              </div>
              <div className="mr-1 w-full md:w-3/4">
                <NumberInput
                  label={'Nonce'}
                  name={`customSafeNonce[${wp.account.prefixedAddress}]`}
                  placeholder={wp.defaultNonce.toString()}
                  min={0}
                />
              </div>
            </div>
          ))}
        </Collapsable>
      </div>
    </>
  )
}
