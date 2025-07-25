import { authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { FetchRolesDocument, RoleListEntryFragment } from '@/graphql'
import { graphqlClient } from '@/graphql-client'
import { Chain } from '@/routes-ui'
import { invariant, invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { dbClient, getAccounts, getRoles, getWorkspace } from '@zodiac/db'
import { Account } from '@zodiac/db/schema'
import { decodeRoleKey } from '@zodiac/modules'
import { isUUID, PrefixedAddress, verifyHexAddress } from '@zodiac/schema'
import {
  DateValue,
  SecondaryLinkButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { Address } from '@zodiac/web3'
import { href } from 'react-router'
import { prefixAddress } from 'ser-kit'
import type { Route } from './+types/list'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { workspaceId },
      context: {
        auth: { tenant },
      },
    }) => {
      invariantResponse(isUUID(workspaceId), '"workspaceId" is no UUID')

      const accounts = await getAccounts(dbClient(), {
        workspaceId,
        tenantId: tenant.id,
      })

      const onChainRoles = await Promise.all(
        accounts.flatMap(async (account) => {
          const { rolesModifiers } = await graphqlClient().query(
            FetchRolesDocument,
            { account: prefixAddress(account.chainId, account.address) },
          )

          return rolesModifiers
        }),
      )

      const rolesByAccount = onChainRoles
        .flat()
        .reduce<
          Record<
            PrefixedAddress,
            { account: Account; roles: RoleListEntryFragment[] }
          >
        >((result, { roles, avatar: _avatar, chainId }) => {
          if (roles.length === 0) {
            return result
          }

          const avatar = verifyHexAddress(_avatar)
          const prefixedAddress = prefixAddress(verifyChainId(chainId), avatar)
          const account = accounts.find(
            (a) => a.address === avatar && a.chainId === chainId,
          )

          invariant(
            account != null,
            `Could not find account with address "${avatar}" on chain "${chainId}"`,
          )

          if (prefixedAddress in result) {
            return {
              ...result,

              [avatar]: {
                account,
                roles: [...result[prefixedAddress].roles, ...roles],
              },
            }
          }

          return { ...result, [prefixedAddress]: { account, roles } }
        }, {})

      return {
        rolesByAccount,
        draftRoles: await getRoles(dbClient(), { workspaceId }),
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { workspaceId }, tenant }) {
        invariantResponse(isUUID(workspaceId), '"workspaceId" is no UUID')

        const workspace = await getWorkspace(dbClient(), workspaceId)

        return workspace.tenantId === tenant.id
      },
    },
  )

const Roles = ({
  loaderData: { rolesByAccount, draftRoles },
  params: { workspaceId },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header
        action={
          <SecondaryLinkButton
            to={href('/workspace/:workspaceId/roles/create', { workspaceId })}
          >
            Create new role
          </SecondaryLinkButton>
        }
      >
        Roles
      </Page.Header>
      <Page.Main>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Label</TableHeader>
              <TableHeader>Created</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {draftRoles.map((draft) => (
              <TableRow key={draft.id}>
                <TableCell>{draft.label}</TableCell>
                <TableCell>
                  <DateValue>{draft.createdAt}</DateValue>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {Object.entries(rolesByAccount).map(([, { account, roles }]) => (
          <section
            key={account.id}
            className="flex flex-col gap-4 rounded border p-4 dark:border-zinc-700"
          >
            <h2 className="font-semibold">
              {account.label}

              <span className="mt-1.5 flex items-center gap-8 text-xs text-zinc-300">
                <Chain chainId={account.chainId} />
                <Address size="small" shorten>
                  {account.address}
                </Address>
              </span>
            </h2>

            <Table bleed dense className="[--gutter:--spacing(4)]">
              <TableHead>
                <TableRow>
                  <TableHeader className="w-1/3">Label</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.key}>
                    <TableCell>{decodeRoleKey(role.key)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        ))}
      </Page.Main>
    </Page>
  )
}

export default Roles
