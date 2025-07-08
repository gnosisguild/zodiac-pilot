import { useIsSignedIn } from '@/auth-client'
import { authorizedAction } from '@/auth-server'
import { OnlyConnected, Page } from '@/components'
import { parseRouteData, routeTitle } from '@/utils'
import { useOptionalWorkspaceId } from '@/workspaces'
import { invariant, invariantResponse } from '@epic-web/invariant'
import {
  createRoute,
  dbClient,
  findDefaultRoute,
  getOrCreateAccount,
  getOrCreateWallet,
  getWorkspace,
  setDefaultRoute,
} from '@zodiac/db'
import { getString } from '@zodiac/form-data'
import {
  CompanionAppMessageType,
  companionRequest,
  CompanionResponseMessageType,
  useExtensionMessageHandler,
} from '@zodiac/messages'
import { isUUID } from '@zodiac/schema'
import {
  Error,
  Info,
  SecondaryLinkButton,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { Suspense, type PropsWithChildren } from 'react'
import { Await, href, useRevalidator } from 'react-router'
import { splitPrefixedAddress } from 'ser-kit'
import type { Route } from './+types/list'
import { Intent } from './intents'
import { loadActiveRouteId } from './loadActiveRouteId'
import { loadRoutes } from './loadRoutes'
import { LocalAccount } from './LocalAccount'

export const meta: Route.MetaFunction = ({ matches }) => [
  { title: routeTitle(matches, 'Safe Accounts') },
]

export const clientLoader = () => ({
  localAccounts: loadRoutes(),
  activeRouteId: loadActiveRouteId(),
})

clientLoader.hydrate = true as const

export const action = async (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      context: {
        auth: { user, tenant },
      },
      params: { workspaceId },
    }) => {
      const data = await request.formData()
      invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID')

      switch (getString(data, 'intent')) {
        case Intent.Upload: {
          const route = parseRouteData(getString(data, 'route'))

          const [chainId, address] = splitPrefixedAddress(route.avatar)

          invariantResponse(chainId != null, 'Cannot use EOA as avatar')

          return await dbClient().transaction(async (tx) => {
            if (route.initiator == null) {
              return { error: 'Route has no initiator' }
            }

            const [, initiator] = splitPrefixedAddress(route.initiator)

            const [account, wallet] = await Promise.all([
              getOrCreateAccount(tx, tenant, {
                workspaceId,
                chainId,
                address,
                ownerId: user.id,
                label: route.label,
              }),
              getOrCreateWallet(tx, user, {
                label: 'Unnamed wallet',
                address: initiator,
              }),
            ])

            if (route.waypoints != null) {
              const defaultRoute = await findDefaultRoute(
                tx,
                tenant,
                user,
                account.id,
              )

              const remoteRoute = await createRoute(tx, tenant.id, {
                label: route.label,
                walletId: wallet.id,
                accountId: account.id,
                waypoints: route.waypoints,
              })

              if (defaultRoute == null) {
                await setDefaultRoute(tx, tenant, user, remoteRoute)
              }
            }

            return null
          })
        }
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { workspaceId }, tenant }) {
        invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID')

        const workspace = await getWorkspace(dbClient(), workspaceId)

        return workspace.tenantId === tenant.id
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

    case Intent.Upload: {
      const uploadResult = await serverAction()

      if (uploadResult != null) {
        return uploadResult
      }

      const { promise, resolve } = Promise.withResolvers<void>()

      companionRequest(
        {
          type: CompanionAppMessageType.DELETE_ROUTE,
          routeId: getString(data, 'routeId'),
        },
        () => resolve(),
      )

      await promise

      return uploadResult
    }

    default: {
      return await serverAction()
    }
  }
}

const ListRoutes = ({
  loaderData: { localAccounts, activeRouteId },
  actionData,
}: Route.ComponentProps) => {
  return (
    <Page fullWidth>
      <Page.Header
        action={
          <SecondaryLinkButton to={useCreateUrl()}>
            Create new local account
          </SecondaryLinkButton>
        }
      >
        Local Safe Accounts
        <p aria-hidden className="my-2 text-sm opacity-80">
          Local accounts live only on your machine. They are only usable when
          the Pilot browser extension is installed and open.
        </p>
      </Page.Header>

      <Page.Main>
        {actionData != null && (
          <Error title="Upload not possible">{actionData.error}</Error>
        )}

        <OnlyConnected showWarning>
          <Suspense>
            <Await resolve={localAccounts}>
              {(localAccounts) => {
                if (localAccounts.length === 0) {
                  return (
                    <Info title="You haven't added any local Safe Accounts.">
                      Add your Safe to start recording transactions for it.
                      <div className="mt-4 flex">
                        <SecondaryLinkButton
                          to={href('/offline/accounts/create')}
                        >
                          Add Safe Account
                        </SecondaryLinkButton>
                      </div>
                    </Info>
                  )
                }

                return (
                  <Suspense>
                    <Await resolve={activeRouteId}>
                      {(activeRouteId) => (
                        <>
                          <RevalidateWhenActiveRouteChanges
                            activeRouteId={activeRouteId}
                          />

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
                )
              }}
            </Await>
          </Suspense>
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
        <TableRow withActions>
          <TableHeader>Name</TableHeader>
          <TableHeader className="relative w-0">
            <span className="sr-only">Active</span>
          </TableHeader>
          <TableHeader>Chain</TableHeader>
          <TableHeader>Pilot Signer</TableHeader>
          <TableHeader>Safe Account</TableHeader>
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

const useCreateUrl = () => {
  const isSignedIn = useIsSignedIn()
  const workspaceId = useOptionalWorkspaceId()

  if (isSignedIn) {
    invariant(workspaceId != null, 'A signed in user needs a workspace')

    return href('/workspace/:workspaceId/local-accounts/create', {
      workspaceId,
    })
  }

  return href('/offline/accounts/create')
}
