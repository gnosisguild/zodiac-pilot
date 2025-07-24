import { Page } from '@/components'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { encode } from '@zodiac/schema'
import { href, redirect } from 'react-router'
import type { Route } from './+types/load-account'

export const clientLoader = async ({
  params: { accountId, workspaceId },
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
        workspaceId == null
          ? href('/offline/accounts/:accountId/:data', {
              accountId: route.id,
              data: encode(route),
            })
          : href('/workspace/:workspaceId/local-accounts/:accountId/:data', {
              workspaceId,
              accountId: route.id,
              data: encode(route),
            }),
      )
    },
  )

  return redirect(await promise)
}

clientLoader.hydrate = true as const

const LoadAccount = () => {
  return (
    <Page>
      <Page.Main>Loading account...</Page.Main>
    </Page>
  )
}

export default LoadAccount
