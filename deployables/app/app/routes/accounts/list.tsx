import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { Chain } from '@/routes-ui'
import { routeTitle } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import {
  countWorkspaces,
  dbClient,
  deleteAccount,
  findActiveAccount,
  getAccount,
  getAccounts,
  getWorkspace,
} from '@zodiac/db'
import { getString, getUUID } from '@zodiac/form-data'
import { isUUID } from '@zodiac/schema'
import {
  GhostLinkButton,
  Info,
  MeatballMenu,
  PrimaryLinkButton,
  SecondaryLinkButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowActions,
  Tag,
} from '@zodiac/ui'
import { Address } from '@zodiac/web3'
import { ArrowRight, Pencil, Trash2 } from 'lucide-react'
import { type PropsWithChildren } from 'react'
import { href, Outlet } from 'react-router'
import type { Route } from './+types/list'
import { Intent } from './intents'

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
      params: { workspaceId },
    }) => {
      invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID"')

      const [accounts, activeAccount, workspaceCount] = await Promise.all([
        getAccounts(dbClient(), {
          tenantId: tenant.id,
          workspaceId,
        }),
        findActiveAccount(dbClient(), tenant, user),
        countWorkspaces(dbClient(), { tenantId: tenant.id }),
      ])

      return {
        accounts,
        activeAccountId: activeAccount == null ? null : activeAccount.id,
        workspaceCount,
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { workspaceId } }) {
        invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID"')

        const workspace = await getWorkspace(dbClient(), workspaceId)

        return workspace.tenantId === tenant.id
      },
    },
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
      async hasAccess({ user, tenant, request, params: { workspaceId } }) {
        invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID"')

        const data = await request.formData()

        const workspace = await getWorkspace(dbClient(), workspaceId)

        if (workspace.tenantId !== tenant.id) {
          return false
        }

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
  loaderData: { accounts, activeAccountId, workspaceCount },
  params: { workspaceId },
}: Route.ComponentProps) => {
  return (
    <Page fullWidth>
      <Page.Header
        action={
          accounts.length > 0 && (
            <SecondaryLinkButton
              to={href(
                '/workspace/:workspaceId/accounts/create/:prefixedAddress?',
                { workspaceId },
              )}
            >
              Create new account
            </SecondaryLinkButton>
          )
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
                Create new account
              </PrimaryLinkButton>
            </Info.Actions>
          </Info>
        )}

        {accounts.length > 0 && (
          <Accounts>
            {accounts.map((account) => (
              <TableRow
                key={account.id}
                href={href('/workspace/:workspaceId/accounts/:accountId', {
                  accountId: account.id,
                  workspaceId: account.workspaceId,
                })}
              >
                <TableCell aria-describedby={account.id}>
                  {account.label}
                </TableCell>
                <TableCell>
                  {activeAccountId === account.id && (
                    <Tag id={account.id} color="green">
                      Active
                    </Tag>
                  )}
                </TableCell>
                <TableCell>
                  <Chain chainId={account.chainId} />
                </TableCell>
                <TableCell>
                  <Address shorten>{account.address}</Address>
                </TableCell>
                <TableCell>
                  <TableRowActions>
                    <MeatballMenu size="tiny" label="Account options">
                      <GhostLinkButton
                        to={href(
                          '/workspace/:workspaceId/accounts/:accountId',
                          {
                            accountId: account.id,
                            workspaceId: account.workspaceId,
                          },
                        )}
                        icon={Pencil}
                        align="left"
                        size="tiny"
                      >
                        Edit
                      </GhostLinkButton>

                      <GhostLinkButton
                        to={href(
                          '/workspace/:workspaceId/accounts/move/:accountId',
                          {
                            accountId: account.id,
                            workspaceId: account.workspaceId,
                          },
                        )}
                        disabled={workspaceCount === 1}
                        icon={ArrowRight}
                        align="left"
                        size="tiny"
                      >
                        Move
                      </GhostLinkButton>

                      <GhostLinkButton
                        to={href(
                          '/workspace/:workspaceId/accounts/delete/:accountId',
                          {
                            workspaceId: account.workspaceId,
                            accountId: account.id,
                          },
                        )}
                        size="tiny"
                        style="critical"
                        align="left"
                        icon={Trash2}
                      >
                        Delete
                      </GhostLinkButton>
                    </MeatballMenu>
                  </TableRowActions>
                </TableCell>
              </TableRow>
            ))}
          </Accounts>
        )}
      </Page.Main>

      <Outlet />
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
