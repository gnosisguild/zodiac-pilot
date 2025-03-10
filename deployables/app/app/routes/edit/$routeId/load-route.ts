import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { encode } from '@zodiac/schema'
import { href, redirect } from 'react-router'
import type { Route } from './+types/load-route'

export const clientLoader = async ({
  params: { routeId },
}: Route.ClientLoaderArgs) => {
  const { promise, resolve } = Promise.withResolvers<string>()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTE,
      routeId,
    },
    ({ route }) =>
      resolve(
        href('/edit/:routeId/:data', {
          routeId: route.id,
          data: encode(route),
        }),
      ),
  )

  return redirect(await promise)
}
