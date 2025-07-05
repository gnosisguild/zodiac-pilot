import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { encode } from '@zodiac/schema'
import { href, redirect } from 'react-router'
import type { Route } from './+types/load-account'

export const clientLoader = async ({
  params: { accountId },
}: Route.ClientLoaderArgs) => {
  const { promise, resolve, reject } = Promise.withResolvers<string>()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTE,
      routeId: accountId,
    },
    ({ route }) => {
      if (route == null) {
        return reject(
          `Account with id "${accountId}" does not exist in the local extension scope`,
        )
      }

      resolve(
        href('/offline/account/:accountId/:data', {
          accountId: route.id,
          data: encode(route),
        }),
      )
    },
  )

  return redirect(await promise)
}
