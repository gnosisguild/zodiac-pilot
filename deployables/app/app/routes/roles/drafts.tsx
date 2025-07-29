import { authorizedLoader } from '@/auth-server'
import { FetchRolesDocument, RoleListEntryFragment } from '@/graphql'
import { graphqlClient } from '@/graphql-client'
import { invariant, invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { dbClient, getAccounts, getRoles, getWorkspace } from '@zodiac/db'
import { Account } from '@zodiac/db/schema'
import { isUUID, PrefixedAddress, verifyHexAddress } from '@zodiac/schema'
import {
  DateValue,
  Info,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { prefixAddress } from 'ser-kit'
import type { Route } from './+types/drafts'

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

const DraftRoles = ({ loaderData: { draftRoles } }: Route.ComponentProps) => {
  if (draftRoles.length === 0) {
    return <Info>You don't have any draft roles</Info>
  }

  return (
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
  )
}

export default DraftRoles
