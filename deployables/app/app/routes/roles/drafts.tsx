import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getActivatedAccounts,
  getRole,
  getRoleMembers,
  getRoles,
  getWorkspace,
} from '@zodiac/db'
import { getUUID } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import {
  DateValue,
  Empty,
  GhostButton,
  GhostLinkButton,
  Info,
  InlineForm,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowActions,
} from '@zodiac/ui'
import { Address } from '@zodiac/web3'
import { UUID } from 'crypto'
import { CloudUpload, Pencil } from 'lucide-react'
import { href } from 'react-router'
import {
  AccountType,
  planApplyAccounts,
  prefixAddress,
  queryAccounts,
  type Account,
} from 'ser-kit'
import type { Route } from './+types/drafts'
import { Intent } from './intents'

type Role = Extract<Account, { type: AccountType.ROLES }>

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

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ request }) => {
      const data = await request.formData()
      const draft = await getRole(dbClient(), getUUID(data, 'draftId'))

      const activatedAccounts = await getActivatedAccounts(dbClient(), {
        roleId: draft.id,
      })

      const currentActivatedAccounts = await queryAccounts(
        activatedAccounts.map((account) =>
          prefixAddress(account.chainId, account.address),
        ),
      )

      planApplyAccounts({
        desired: [
          ...currentActivatedAccounts.map((account) => {
            invariantResponse(
              account.type === AccountType.SAFE,
              'Account is not a safe',
            )

            return {
              type: AccountType.ROLES,
              avatar: account.address,
              chain: account.chain,
              allowances: [],
              modules: [],
              roles: [],
              version: 2,
            } satisfies Account
          }),
        ],
      })

      return null
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
  params: { workspaceId },
}: Route.ComponentProps) => {
  if (draftRoles.length === 0) {
    return <Info>You don't have any draft roles</Info>
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
        {draftRoles.map((draft) => (
          <TableRow key={draft.id}>
            <TableCell>{draft.label}</TableCell>
            <TableCell>
              <DateValue>{draft.createdAt}</DateValue>
            </TableCell>
            <TableCell>{draft.createBy.fullName}</TableCell>
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
            <TableCell>
              <TableRowActions>
                <GhostLinkButton
                  iconOnly
                  icon={Pencil}
                  size="tiny"
                  to={href('/workspace/:workspaceId/roles/:roleId', {
                    workspaceId,
                    roleId: draft.id,
                  })}
                >
                  Edit
                </GhostLinkButton>

                <DeployDraft draftId={draft.id} />
              </TableRowActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default DraftRoles

const DeployDraft = ({ draftId }: { draftId: UUID }) => {
  return (
    <InlineForm context={{ draftId }}>
      <GhostButton
        submit
        iconOnly
        size="tiny"
        icon={CloudUpload}
        intent={Intent.Deploy}
        busy={useIsPending(
          Intent.Deploy,
          (data) => data.get('draftId') === draftId,
        )}
      >
        Deploy
      </GhostButton>
    </InlineForm>
  )
}
