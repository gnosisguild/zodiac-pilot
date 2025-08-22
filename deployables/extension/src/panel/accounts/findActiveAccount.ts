import {
  findRemoteActiveAccount,
  toAccount,
  type FetchOptions,
} from '@/companion'
import {
  findAdHocRoute,
  getLastUsedAccountId,
  getRoutes,
} from '@/execution-routes'

export const findActiveAccount = async (options: FetchOptions = {}) => {
  // 1) active ad-hoc route
  const activeAccountId = await getLastUsedAccountId()
  const adHocRoute = findAdHocRoute()
  if (adHocRoute != null && adHocRoute.id === activeAccountId) {
    return toAccount(adHocRoute)
  }

  // 2) active remote account
  const activeAccount = await findRemoteActiveAccount(options)

  if (activeAccount != null) {
    return activeAccount
  }

  // 3) active local route
  const routes = await getRoutes()
  const route = routes.find((route) => route.id === activeAccountId)

  if (route == null) {
    return null
  }

  return toAccount(route)
}
