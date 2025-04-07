import { fromVersion, OnlyConnected, Page } from '@/components'
import {
  dbClient,
  deleteAccount,
  getAccount,
  getAccounts,
  type Account,
} from '@/db'
import { routeTitle } from '@/utils'
import { authKitAction, authKitLoader } from '@/workOS/server'
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
import { Suspense, type PropsWithChildren } from 'react'
import { Await, useRevalidator } from 'react-router'
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
          loggedIn: false,
          remoteAccounts: [] as Account[],
        }
      }

      return {
        loggedIn: true,
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
  const serverData = await serverLoader()

  return {
    ...serverData,
    localAccounts: loadRoutes(),
    activeRouteId: fromVersion('3.6.0', () => loadActiveRouteId()),
  }
}

clientLoader.hydrate = true as const

export const action = async (args: Route.ActionArgs) =>
  authKitAction(
    args,
    async ({
      request,
      context: {
        auth: { user },
      },
    }) => {
      const data = await request.formData()

      switch (getString(data, 'intent')) {
        case Intent.RemoteDelete: {
          await deleteAccount(dbClient(), user, getString(data, 'accountId'))

          return null
        }
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ user, request }) {
        const data = await request.formData()
        const account = await getAccount(
          dbClient(),
          getString(data, 'accountId'),
        )

        return account.createdById === user.id
      },
    },
  )

export const clientAction = async ({
  request,
  serverAction,
}: Route.ClientActionArgs) => {
  const data = await request.clone().formData()
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

    default: {
      return await serverAction()
    }
  }
}

const ListRoutes = ({
  loaderData: { remoteAccounts, loggedIn, ...clientData },
}: Route.ComponentProps) => {
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

        <OnlyConnected showWarning={!loggedIn}>
          {'localAccounts' in clientData && (
            <Suspense>
              <Await resolve={clientData.localAccounts}>
                {(localAccounts) => (
                  <>
                    {localAccounts.length > 0 ? (
                      <Suspense>
                        <Await resolve={clientData.activeRouteId}>
                          {(activeRouteId) => (
                            <>
                              <RevalidateWhenActiveRouteChanges
                                activeRouteId={activeRouteId}
                              />

                              <h2 className="my-6 text-xl">
                                Local Accounts
                                <p className="my-2 text-sm opacity-80">
                                  Local accounts live only on your machine. They
                                  are only usable when the Pilot browser
                                  extension is installed and open.
                                </p>
                              </h2>

                              <Accounts>
                                {localAccounts.map((route) => (
                                  <LocalAccount
                                    key={route.id}
                                    route={route}
                                    active={route.id === activeRouteId}
                                  />
                                ))}
                              </Accounts>
                            </>
                          )}
                        </Await>
                      </Suspense>
                    ) : (
                      <Info title="You haven't created any accounts, yet.">
                        Accounts let you quickly impersonate other safes and
                        record transaction bundles for them.
                        <div className="mt-4 flex">
                          <SecondaryLinkButton to="/create">
                            Create an account
                          </SecondaryLinkButton>
                        </div>
                      </Info>
                    )}
                  </>
                )}
              </Await>
            </Suspense>
          )}
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

const RevalidateWhenActiveRouteChanges = ({
  activeRouteId,
}: {
  activeRouteId: string | void | null
}) => {
  const { revalidate, state } = useRevalidator()

  useExtensionMessageHandler(
    CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
    ({ activeRouteId: newActiveRouteId }) => {
      if (state === 'idle' && activeRouteId !== newActiveRouteId) {
        revalidate()
      }
    },
  )

  return null
}
