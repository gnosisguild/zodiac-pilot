import type { ExecutionRoute } from '@zodiac/schema'
import {
  queryRoutes as baseQueryRoutes,
  unprefixAddress,
  type PrefixedAddress,
} from 'ser-kit'

type SuccessResult = { error: null; routes: ExecutionRoute[] }
type ErrorResult = { error: unknown; routes: never[] }

type QueryRoutesResult = SuccessResult | ErrorResult

export const queryRoutes = async (
  initiator: PrefixedAddress,
  avatar: PrefixedAddress,
): Promise<QueryRoutesResult> => {
  try {
    const routes = await baseQueryRoutes(unprefixAddress(initiator), avatar)

    return {
      error: null,
      routes,
    }
  } catch (error) {
    return {
      error,
      routes: [],
    }
  }
}
