import type { Route } from './+types/health'

export const loader = async ({ context: { dbClient } }: Route.LoaderArgs) => {
  return 'OK'
}
