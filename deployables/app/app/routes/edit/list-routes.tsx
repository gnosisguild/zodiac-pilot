import { fromVersion, OnlyConnected, Page } from '@/components'
import { dbClient, getAccounts, type Account } from '@/db'
import { routeTitle } from '@/utils'
import { authKitLoader } from '@/workOS/server'
import { getString } from '@zodiac/form-data'
import {
  CompanionAppMessageType,
  companionRequest,
  CompanionResponseMessageType,
  useExtensionMessageHandler,
} from '@zodiac/messages'
import {
  Info,
  SecondaryLinkButton,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { type PropsWithChildren } from 'react'
import { useRevalidator } from 'react-router'
import type { Route } from './+types/list-routes'
import { Intent } from './intents'
import { loadActiveRouteId } from './loadActiveRouteId'
import { loadRoutes } from './loadRoutes'
import { LocalAccount } from './LocalAccount'
import { RemoteAccount } from './RemoteAccount'

export const meta: Route.MetaFunction = ({ matches }) => [
  { title: routeTitle(matches, 'Accounts') },
]

export const loader = (args: Route.LoaderArgs) =>
  authKitLoader(
    args,
    async ({
      context: {
        auth: { user },
      },
    }) => {
      if (user == null) {
        return {
          remoteAccounts: [] as Account[],
        }
      }

      return {
        remoteAccounts: await getAccounts(dbClient(), {
          tenantId: user.tenantId,
          userId: user.id,
        }),
      }
    },
  )

export const clientLoader = async ({
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const [localAccounts, { remoteAccounts }, activeRouteId] = await Promise.all([
    loadRoutes(),
    serverLoader(),
    fromVersion('3.6.0', () => loadActiveRouteId()),
  ])

  return { localAccounts, remoteAccounts, activeRouteId }
}

clientLoader.hydrate = true as const

export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const data = await request.formData()
  const intent = getString(data, 'intent')

  switch (intent) {
    case Intent.Delete: {
      const { promise, resolve } = Promise.withResolvers<void>()

      companionRequest(
        {
          type: CompanionAppMessageType.DELETE_ROUTE,
          routeId: getString(data, 'routeId'),
        },
        () => resolve(),
      )

      await promise

      return null
    }

    case Intent.Launch: {
      const { promise, resolve } = Promise.withResolvers<void>()

      companionRequest(
        {
          type: CompanionAppMessageType.LAUNCH_ROUTE,
          routeId: getString(data, 'routeId'),
        },
        () => resolve(),
      )

      await promise

      return null
    }
  }
}

const ListRoutes = ({
  loaderData: { remoteAccounts, ...clientData },
}: Route.ComponentProps) => {
  const { revalidate, state } = useRevalidator()

  useExtensionMessageHandler(
    CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
    ({ activeRouteId }) => {
      if (
        state === 'idle' &&
        'activeRouteId' in clientData &&
        activeRouteId !== clientData.activeRouteId
      ) {
        revalidate()
      }
    },
  )

  return (
    <Page fullWidth>
      <Page.Header>Accounts</Page.Header>

      <Page.Main>
        {remoteAccounts.length > 0 && (
          <Accounts>
            {remoteAccounts.map((account) => (
              <RemoteAccount key={account.id} account={account} />
            ))}
          </Accounts>
        )}

        <OnlyConnected>
          {'localAccounts' in clientData &&
            (clientData.localAccounts.length > 0 ? (
              <Accounts>
                {clientData.localAccounts.map((route) => (
                  <LocalAccount
                    key={route.id}
                    route={route}
                    active={route.id === clientData.activeRouteId}
                  />
                ))}
              </Accounts>
            ) : (
              <Info title="You haven't created any accounts, yet.">
                Accounts let you quickly impersonate other safes and record
                transaction bundles for them.
                <div className="mt-4 flex">
                  <SecondaryLinkButton to="/create">
                    Create an account
                  </SecondaryLinkButton>
                </div>
              </Info>
            ))}
        </OnlyConnected>
      </Page.Main>
    </Page>
  )
}

export default ListRoutes

const Accounts = ({ children }: PropsWithChildren) => {
  return (
    <Table
      bleed
      className="[--gutter:--spacing(8)] sm:[--gutter:--spacing(16)]"
    >
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader className="relative w-0">
            <span className="sr-only">Active</span>
          </TableHeader>
          <TableHeader>Chain</TableHeader>
          <TableHeader>Operator</TableHeader>
          <TableHeader>Account</TableHeader>
          <TableHeader className="relative w-0">
            <span className="sr-only">Actions</span>
          </TableHeader>
        </TableRow>
      </TableHead>

      <TableBody>{children}</TableBody>
    </Table>
  )
}
