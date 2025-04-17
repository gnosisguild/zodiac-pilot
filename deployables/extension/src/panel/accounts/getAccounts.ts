import { getRemoteAccounts, toAccount, type FetchOptions } from '@/companion'
import { getRoutes } from '@/execution-routes'
import { sortAccounts } from './sortAccounts'

export const getAccounts = async (options: FetchOptions = {}) => {
  const [accounts, routes] = await Promise.all([
    getRemoteAccounts(options),
    getRoutes(),
  ])

  return [...accounts, ...routes.map(toAccount)].toSorted(sortAccounts)
}
