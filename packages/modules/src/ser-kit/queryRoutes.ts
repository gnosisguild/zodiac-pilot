import {
  queryRoutes as baseQueryRoutes,
  unprefixAddress,
  type PrefixedAddress,
  type Route,
} from 'ser-kit'

type SuccessResult = { error: null; routes: Route[] }
type ErrorResult = { error: unknown; routes: never[] }

export type QueryRoutesResult = SuccessResult | ErrorResult

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
    console.error(error)

    return {
      error,
      routes: [],
    }
  }
}
