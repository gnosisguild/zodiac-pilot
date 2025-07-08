import { getRemoteAccounts, toAccount, type FetchOptions } from '@/companion'
import { getAdHocRoute, getRoutes } from '@/execution-routes'
import { sortAccounts } from './sortAccounts'

export const getAccounts = async (options: FetchOptions = {}) => {
  const [accounts, routes] = await Promise.all([
    getRemoteAccounts(options),
    getRoutes(),
  ])

  const result = [...accounts, ...routes.map(toAccount)].toSorted(sortAccounts)

  // if we have an ad-hoc route, add it to the beginning of the list
  const adHocRoute = getAdHocRoute()
  if (adHocRoute != null) {
    result.unshift(toAccount(adHocRoute))
  }

  return result
}
