import { dbClient, getTenants } from '@zodiac/db'

export const loader = async () => {
  await getTenants(dbClient())

  return 'OK'
}
