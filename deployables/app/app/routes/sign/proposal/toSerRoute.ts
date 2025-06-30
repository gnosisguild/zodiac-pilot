import { invariant } from '@epic-web/invariant'
import type { ExecutionRoute } from '@zodiac/schema'
import type { Route } from 'ser-kit'

export const toSerRoute = ({
  initiator,
  waypoints,
  ...executionRoute
}: ExecutionRoute): Route => {
  invariant(
    initiator != null,
    'Execution route needs an initiator to be a valid ser route',
  )
  invariant(
    waypoints != null,
    'Execution route needs to define waypoints to be a valid ser route',
  )

  return {
    initiator,
    waypoints,

    ...executionRoute,
  }
}
