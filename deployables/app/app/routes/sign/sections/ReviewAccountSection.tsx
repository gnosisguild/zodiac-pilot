import { ChainSelect, Route, Routes, Waypoint, Waypoints } from '@/routes-ui'
import { invariant } from '@epic-web/invariant'

import { Collapsible, Error, Labeled, NumberInput, Warning } from '@zodiac/ui'

import type {
  ChainId,
  PrefixedAddress,
  StartingPoint,
  Waypoint as WaypointType,
} from 'ser-kit'

type NonceMap = {
  [safe: PrefixedAddress]: number
}

type ReviewAccountSectionProps = {
  routeId: string
  routeLabel: string | null | undefined
  isValidRoute: boolean
  hasQueryRoutesError: boolean
  chainId: ChainId
  waypoints: [StartingPoint, ...WaypointType[]]
  defaultSafeNonces: NonceMap
}

export function ReviewAccountSection({
  routeId,
  routeLabel,
  isValidRoute,
  hasQueryRoutesError,
  chainId,
  waypoints,
  defaultSafeNonces,
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

      <Labeled label="Execution route" description={routeLabel}>
        {({ inputId, descriptionId }) => (
          <Routes disabled orientation="horizontal">
            <Route id={routeId} inputId={inputId} descriptionId={descriptionId}>
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
          </Routes>
        )}
      </Labeled>
      <div className="flex flex-col gap-4">
        <Collapsible title="Define custom Safe transaction nonce">
          {Object.entries(defaultSafeNonces).map(
            ([safePrefixedAddress, defaultNonce]) => {
              const wp = waypoints.find(
                (wp) => wp.account.prefixedAddress === safePrefixedAddress,
              )
              invariant(wp, 'waypoint not found')
              return (
                <div
                  key={wp.account.prefixedAddress}
                  className="flex flex-col items-end gap-4 md:flex-row"
                >
                  <div className="w-full md:w-1/3">
                    <Waypoint account={wp.account} />
                  </div>
                  <div className="mr-1 w-full md:w-3/4">
                    <NumberInput
                      label="Nonce"
                      name={`customSafeNonce[${wp.account.prefixedAddress}]`}
                      placeholder={defaultNonce.toString()}
                      min={0}
                    />
                  </div>
                </div>
              )
            },
          )}
        </Collapsible>
      </div>
    </>
  )
}
