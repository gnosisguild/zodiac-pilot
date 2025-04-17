import { authorizedAction, authorizedLoader } from '@/auth'
import { OnlyConnected, Page } from '@/components'
import { routeTitle } from '@/utils'
import {
  dbClient,
  deleteAccount,
  findActiveAccount,
  getAccount,
  getAccounts,
} from '@zodiac/db'
import { getString, getUUID } from '@zodiac/form-data'
import {
  CompanionAppMessageType,
  companionRequest,
  CompanionResponseMessageType,
  useExtensionMessageHandler,
} from '@zodiac/messages'
import {
  Feature,
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
  { title: routeTitle(matches, 'Safe Accounts') },
]

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { user, tenant },
      },
    }) => {
      if (user == null) {
        return {
          loggedIn: false,
          remoteAccounts: [],
          activeRemoteAccountId: null,
        }
      }

      const [remoteAccounts, activeRemoteAccount] = await Promise.all([
        getAccounts(dbClient(), {
          tenantId: tenant.id,
          userId: user.id,
        }),
        findActiveAccount(dbClient(), tenant, user),
      ])

      return {
        loggedIn: true,
        remoteAccounts,
        activeRemoteAccountId:
          activeRemoteAccount == null ? null : activeRemoteAccount.id,
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
    activeRouteId: loadActiveRouteId(),
  }
}

clientLoader.hydrate = true as const

export const action = async (args: Route.ActionArgs) =>
  authorizedAction(
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
          await deleteAccount(dbClient(), user, getUUID(data, 'accountId'))

          return null
        }
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ user, request }) {
        const data = await request.formData()
        const account = await getAccount(dbClient(), getUUID(data, 'accountId'))

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

    default: {
      return await serverAction()
    }
  }
}

const ListRoutes = ({
  loaderData: {
    remoteAccounts,
    activeRemoteAccountId,
    loggedIn,
    ...clientData
  },
}: Route.ComponentProps) => {
  return (
    <Page fullWidth>
      <Page.Header>Safe Accounts</Page.Header>

      <Page.Main>
        {remoteAccounts.length > 0 && (
          <Accounts>
            {remoteAccounts.map((account) => {
              const [activeRoute] = account.activeRoutes

              if (activeRoute != null) {
                const { wallet } = activeRoute.route

                return (
                  <RemoteAccount
                    key={account.id}
                    account={account}
                    active={activeRemoteAccountId === account.id}
                    wallet={wallet}
                  />
                )
              }

              return (
                <RemoteAccount
                  key={account.id}
                  account={account}
                  active={activeRemoteAccountId === account.id}
                />
              )
            })}
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

                              <Feature feature="user-management">
                                <h2 className="my-6 text-xl">
                                  Local Accounts
                                  <p className="my-2 text-sm opacity-80">
                                    Local accounts live only on your machine.
                                    They are only usable when the Pilot browser
                                    extension is installed and open.
                                  </p>
                                </h2>
                              </Feature>

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
                      <Info title="You haven't added any Safe Accounts, yet.">
                        Add your Safe to start recording transactions for it.
                        <div className="mt-4 flex">
                          <SecondaryLinkButton to="/create">
                            Add Safe Account
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
          <TableHeader>Pilot Signer</TableHeader>
          <TableHeader>Safe Account</TableHeader>
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
        setTimeout(() => revalidate(), 500)
      }
    },
  )

  return null
}
