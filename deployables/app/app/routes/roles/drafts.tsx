import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getActivatedAccounts,
  getRoleMembers,
  getRoles,
  getWorkspace,
} from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
import {
  DateValue,
  Empty,
  Info,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { Address } from '@zodiac/web3'
import type { Route } from './+types/drafts'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { workspaceId } }) => {
      invariantResponse(isUUID(workspaceId), '"workspaceId" is no UUID')

      return {
        draftRoles: await getRoles(dbClient(), { workspaceId }),
        activatedAccounts: await getActivatedAccounts(dbClient(), {
          workspaceId,
        }),
        members: await getRoleMembers(dbClient(), { workspaceId }),
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

const DraftRoles = ({
  loaderData: { draftRoles, activatedAccounts, members },
}: Route.ComponentProps) => {
  if (draftRoles.length === 0) {
    return <Info>You don't have any draft roles</Info>
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Label</TableHeader>
          <TableHeader>Created</TableHeader>
          <TableHeader>Accounts</TableHeader>
          <TableHeader>Members</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {draftRoles.map((draft) => (
          <TableRow key={draft.id}>
            <TableCell>{draft.label}</TableCell>
            <TableCell>
              <DateValue>{draft.createdAt}</DateValue>
            </TableCell>
            <TableCell>
              {activatedAccounts[draft.id] == null ? (
                <Empty />
              ) : (
                <span className="inline-flex cursor-pointer underline">
                  <Popover
                    popover={
                      <ol className="m-1 flex flex-col gap-2">
                        {activatedAccounts[draft.id].map((account) => (
                          <li key={account.id}>
                            <Address shorten size="small" label={account.label}>
                              {account.address}
                            </Address>
                          </li>
                        ))}
                      </ol>
                    }
                  >
                    {activatedAccounts[draft.id].length} accounts
                  </Popover>
                </span>
              )}
            </TableCell>
            <TableCell>
              {members[draft.id] == null ? (
                <Empty />
              ) : (
                <span className="inline-flex cursor-pointer underline">
                  <Popover
                    popover={
                      <ol className="m-1 flex flex-col gap-2">
                        {members[draft.id].map((member) => (
                          <li key={member.id} className="text-xs">
                            {member.fullName}
                          </li>
                        ))}
                      </ol>
                    }
                  >
                    {members[draft.id].length} members
                  </Popover>
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default DraftRoles
