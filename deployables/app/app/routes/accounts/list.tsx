import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
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
  Info,
  PrimaryLinkButton,
  SecondaryLinkButton,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { type PropsWithChildren } from 'react'
import { href } from 'react-router'
import type { Route } from './+types/list'
import { Intent } from './intents'
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
      const [accounts, activeAccount] = await Promise.all([
        getAccounts(dbClient(), {
          tenantId: tenant.id,
          userId: user.id,
        }),
        findActiveAccount(dbClient(), tenant, user),
      ])

      return {
        accounts,
        activeAccountId: activeAccount == null ? null : activeAccount.id,
      }
    },
    { ensureSignedIn: true },
  )

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
        case Intent.DeleteAccount: {
          await deleteAccount(dbClient(), user, getUUID(data, 'accountId'))

          return null
        }
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ user, request }) {
        const data = await request.formData()

        switch (getString(data, 'intent')) {
          case Intent.DeleteAccount: {
            const account = await getAccount(
              dbClient(),
              getUUID(data, 'accountId'),
            )

            return account.createdById === user.id
          }

          default: {
            return true
          }
        }
      },
    },
  )

const ListRoutes = ({
  loaderData: { accounts, activeAccountId },
  params: { workspaceId },
}: Route.ComponentProps) => {
  return (
    <Page fullWidth>
      <Page.Header
        action={
          <SecondaryLinkButton
            to={href(
              '/workspace/:workspaceId/accounts/create/:prefixedAddress?',
              { workspaceId },
            )}
          >
            Create new account
          </SecondaryLinkButton>
        }
      >
        Safe Accounts
      </Page.Header>

      <Page.Main>
        {accounts.length === 0 && (
          <Info title="No accounts">
            You haven't created any accounts, yet.
            <Info.Actions>
              <PrimaryLinkButton
                size="small"
                to={href(
                  '/workspace/:workspaceId/accounts/create/:prefixedAddress?',
                  { workspaceId },
                )}
              >
                Create your first account
              </PrimaryLinkButton>
            </Info.Actions>
          </Info>
        )}

        {accounts.length > 0 && (
          <Accounts>
            {accounts.map((account) => {
              const [defaultRoute] = account.defaultRoutes

              if (defaultRoute != null) {
                return (
                  <RemoteAccount
                    key={account.id}
                    account={account}
                    active={activeAccountId === account.id}
                  />
                )
              }

              return (
                <RemoteAccount
                  key={account.id}
                  account={account}
                  active={activeAccountId === account.id}
                />
              )
            })}
          </Accounts>
        )}
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
          <TableHeader>Safe Account</TableHeader>
        </TableRow>
      </TableHead>

      <TableBody>{children}</TableBody>
    </Table>
  )
}
