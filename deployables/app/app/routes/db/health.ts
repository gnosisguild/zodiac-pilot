import { dbClient, getTenants } from '@/db'

export const loader = async () => {
  await getTenants(dbClient())

  return 'OK'
}
