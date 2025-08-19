import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  cancelRoleDeployment,
  createRoleDeployment,
  createRoleDeploymentStep,
  dbClient,
  findPendingRoleDeployment,
  getActivatedAccounts,
  getRole,
  getRoleDeployment,
  getRoleMembers,
  getRoles,
  getWorkspace,
} from '@zodiac/db'
import { getEnumValue, getUUID } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import {
  DateValue,
  Empty,
  GhostButton,
  GhostLinkButton,
  Info,
  InlineForm,
  Modal,
  Popover,
  PrimaryLinkButton,
  SecondaryButton,
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
import { href, redirect } from 'react-router'
import type { Route } from './+types/managed'
import { Intent } from './intents'
import { Issues } from './issues'
import { planRoleUpdate } from './planRoleUpdate'

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

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      context: {
        auth: { user },
      },
    }) => {
      const data = await request.formData()

      switch (getEnumValue(Intent, data, 'intent')) {
        case Intent.Deploy: {
          const roleId = getUUID(data, 'roleId')
          const role = await getRole(dbClient(), roleId)

          const pendingDeployment = await findPendingRoleDeployment(
            dbClient(),
            roleId,
          )

          if (pendingDeployment != null) {
            return { pendingDeploymentId: pendingDeployment.id, roleId }
          }

          const { plan, issues } = await planRoleUpdate(roleId)

          if (issues.length > 0) {
            return { issues }
          }

          const deployment = await dbClient().transaction(async (tx) => {
            const deployment = await createRoleDeployment(tx, user, role)

            for (const { steps, account } of plan) {
              await createRoleDeploymentStep(tx, deployment, {
                account,
                calls: steps.map(({ call }) => call),
                transactionBundle: steps.map(({ transaction }) => transaction),
              })
            }

            return deployment
          })

          return redirect(
            href(
              '/workspace/:workspaceId/roles/:roleId/deployment/:deploymentId',
              {
                deploymentId: deployment.id,
                roleId: deployment.roleId,
                workspaceId: deployment.workspaceId,
              },
            ),
          )
        }
        case Intent.CancelDeployment: {
          await cancelRoleDeployment(
            dbClient(),
            user,
            getUUID(data, 'deploymentId'),
          )

          return null
        }
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ request, tenant, params: { workspaceId } }) {
        const data = await request.formData()

        switch (getEnumValue(Intent, data, 'intent')) {
          case Intent.Deploy: {
            const role = await getRole(dbClient(), getUUID(data, 'roleId'))

            return (
              role.tenantId === tenant.id && role.workspaceId === workspaceId
            )
          }
          case Intent.CancelDeployment: {
            const deployment = await getRoleDeployment(
              dbClient(),
              getUUID(data, 'deploymentId'),
            )

            return (
              deployment.tenantId === tenant.id &&
              deployment.workspaceId === workspaceId
            )
          }
          default:
            return false
        }
      },
    },
  )

const ManagedRoles = ({
  loaderData: { roles, activatedAccounts, members },
  actionData,
  params: { workspaceId },
}: Route.ComponentProps) => {
  if (roles.length === 0) {
    return <Info>You haven't created any roles</Info>
  }

  return (
    <>
      {actionData != null && (
        <>
          {actionData.pendingDeploymentId != null && (
            <Modal
              open
              title="Deployment already in progress"
              description="This role is currently in the progress of being deployed. You can either open the current deployment or cancel it."
            >
              <Modal.Actions>
                <PrimaryLinkButton
                  to={href(
                    '/workspace/:workspaceId/roles/:roleId/deployment/:deploymentId',
                    {
                      workspaceId,
                      roleId: actionData.roleId,
                      deploymentId: actionData.pendingDeploymentId,
                    },
                  )}
                >
                  Open deployment
                </PrimaryLinkButton>

                <CancelDeployment
                  deploymentId={actionData.pendingDeploymentId}
                />

                <Modal.CloseAction>Cancel</Modal.CloseAction>
              </Modal.Actions>
            </Modal>
          )}

          {actionData.issues != null && (
            <Modal
              open
              title="Please check your configuration"
              description="We identified one or more issues with your role configuration."
            >
              <Issues issues={actionData.issues} />

              <Modal.Actions>
                <Modal.CloseAction>Cancel</Modal.CloseAction>
              </Modal.Actions>
            </Modal>
          )}
        </>
      )}

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
                              <Address
                                shorten
                                size="small"
                                label={account.label}
                              >
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
                <TableRowActions>
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

                  <Deploy roleId={role.id} />
                </TableRowActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default ManagedRoles

const Deploy = ({ roleId }: { roleId: UUID }) => (
  <InlineForm context={{ roleId }}>
    <GhostButton
      submit
      size="tiny"
      icon={CloudUpload}
      intent={Intent.Deploy}
      busy={useIsPending(
        Intent.Deploy,
        (data) => data.get('roleId') === roleId,
      )}
    >
      Deploy
    </GhostButton>
  </InlineForm>
)

const CancelDeployment = ({ deploymentId }: { deploymentId: UUID }) => (
  <InlineForm context={{ deploymentId }}>
    <SecondaryButton
      submit
      intent={Intent.CancelDeployment}
      busy={useIsPending(
        Intent.CancelDeployment,
        (data) => data.get('deploymentId') === deploymentId,
      )}
    >
      Cancel deployment
    </SecondaryButton>
  </InlineForm>
)
