import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { encode } from '@zodiac/schema'
import { href, redirect } from 'react-router'
import type { Route } from './+types/load-route'

export const clientLoader = async ({
  params: { routeId },
}: Route.ClientLoaderArgs) => {
  const { promise, resolve, reject } = Promise.withResolvers<string>()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTE,
      routeId,
    },
    ({ route }) => {
      if (route == null) {
        return reject(
          `Route with id "${routeId}" does not exist in the local extension scope`,
        )
      }

      resolve(
        href('/edit/:routeId/:data', {
          routeId: route.id,
          data: encode(route),
        }),
      )
    },
  )

  return redirect(await promise)
}
