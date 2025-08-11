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
  GhostLinkButton,
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
import { CloudUpload, Pencil } from 'lucide-react'
import { href } from 'react-router'
import type { Route } from './+types/managed'
import { Intent } from './intents'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { workspaceId } }) => {
      invariantResponse(isUUID(workspaceId), '"workspaceId" is no UUID')

      return {
        roles: await getRoles(dbClient(), { workspaceId }),
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

const ManagedRoles = ({
  loaderData: { roles, activatedAccounts, members },
  params: { workspaceId },
}: Route.ComponentProps) => {
  if (roles.length === 0) {
    return <Info>You haven't created any roles</Info>
  }

  return (
    <Table>
      <TableHead>
        <TableRow withActions>
          <TableHeader>Label</TableHeader>
          <TableHeader>Created</TableHeader>
          <TableHeader>Created by</TableHeader>
          <TableHeader>Accounts</TableHeader>
          <TableHeader>Members</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell>{role.label}</TableCell>
            <TableCell>
              <DateValue>{role.createdAt}</DateValue>
            </TableCell>
            <TableCell>{role.createBy.fullName}</TableCell>
            <TableCell>
              {activatedAccounts[role.id] == null ? (
                <Empty />
              ) : (
                <span className="inline-flex cursor-pointer underline">
                  <Popover
                    popover={
                      <ol className="m-1 flex flex-col gap-2">
                        {activatedAccounts[role.id].map((account) => (
                          <li key={account.id}>
                            <Address shorten size="small" label={account.label}>
                              {account.address}
                            </Address>
                          </li>
                        ))}
                      </ol>
                    }
                  >
                    {activatedAccounts[role.id].length} accounts
                  </Popover>
                </span>
              )}
            </TableCell>
            <TableCell>
              {members[role.id] == null ? (
                <Empty />
              ) : (
                <span className="inline-flex cursor-pointer underline">
                  <Popover
                    popover={
                      <ol className="m-1 flex flex-col gap-2">
                        {members[role.id].map((member) => (
                          <li key={member.id} className="text-xs">
                            {member.fullName}
                          </li>
                        ))}
                      </ol>
                    }
                  >
                    {members[role.id].length} members
                  </Popover>
                </span>
              )}
            </TableCell>
            <TableCell>
              <GhostLinkButton
                iconOnly
                icon={Pencil}
                size="tiny"
                to={href('/workspace/:workspaceId/roles/:roleId', {
                  workspaceId,
                  roleId: role.id,
                })}
              >
                Edit
              </GhostLinkButton>

              <GhostLinkButton
                replace
                size="tiny"
                icon={CloudUpload}
                intent={Intent.Deploy}
                to={href(
                  '/workspace/:workspaceId/roles/managed/:roleId/deploy',
                  { workspaceId, roleId: role.id },
                )}
              >
                Deploy
              </GhostLinkButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ManagedRoles
