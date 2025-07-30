import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getAccounts,
  getActivatedAccounts,
  getRole,
  getRoleActions,
  getRoleMembers,
  getUsers,
  setActiveAccounts,
  setRoleMembers,
  updateRole,
} from '@zodiac/db'
import { getString, getUUIDList } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import {
  Form,
  FormLayout,
  GhostLinkButton,
  MultiSelect,
  PrimaryButton,
  SecondaryLinkButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
} from '@zodiac/ui'
import { href, Outlet, redirect } from 'react-router'
import { Route } from './+types/edit'
import { AccountSelect } from './AccountSelect'
import { Intent } from './intents'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { roleId, workspaceId },
      context: {
        auth: { tenant },
      },
    }) => {
      invariantResponse(isUUID(roleId), '"roleId" is not a UUID')
      invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID')

      const [members, activeAccounts, role, users, accounts, actions] =
        await Promise.all([
          getRoleMembers(dbClient(), { roleId }),
          getActivatedAccounts(dbClient(), { roleId }),
          getRole(dbClient(), roleId),
          getUsers(dbClient(), { tenantId: tenant.id }),
          getAccounts(dbClient(), { workspaceId }),
          getRoleActions(dbClient(), roleId),
        ])

      return {
        role,
        users,
        accounts,
        activeAccounts: roleId in activeAccounts ? activeAccounts[roleId] : [],
        members: roleId in members ? members[roleId] : [],
        actions,
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { roleId, workspaceId }, tenant }) {
        invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

        const role = await getRole(dbClient(), roleId)

        return role.tenantId === tenant.id && role.workspaceId === workspaceId
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ params: { roleId, workspaceId }, request }) => {
      invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

      const data = await request.formData()

      await dbClient().transaction(async (tx) => {
        const role = await getRole(tx, roleId)

        const label = getString(data, 'label')

        if (label !== role.label) {
          await updateRole(tx, roleId, { label: getString(data, 'label') })
        }

        await setRoleMembers(tx, role, getUUIDList(data, 'members'))
        await setActiveAccounts(tx, role, getUUIDList(data, 'accounts'))
      })

      return redirect(
        href('/workspace/:workspaceId/roles/drafts', { workspaceId }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { roleId, workspaceId }, tenant }) {
        invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

        const role = await getRole(dbClient(), roleId)

        return role.tenantId === tenant.id && role.workspaceId === workspaceId
      },
    },
  )

const EditRole = ({
  loaderData: { role, users, members, accounts, activeAccounts, actions },
  params: { workspaceId, roleId },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Edit role</Page.Header>
      <Page.Main>
        <Form>
          <Form.Section
            title="Base configuration"
            description="Defines the basics for this role. Who should it be enabled for and what accounts are affected."
          >
            <TextInput
              required
              label="Label"
              name="label"
              defaultValue={role.label}
            />

            <MultiSelect
              label="Members"
              name="members"
              options={users.map((user) => ({
                label: user.fullName,
                value: user.id,
              }))}
              defaultValue={members.map((member) => ({
                label: member.fullName,
                value: member.id,
              }))}
            />

            <AccountSelect accounts={accounts} defaultValue={activeAccounts} />

            <Form.Actions>
              <PrimaryButton
                submit
                intent={Intent.Save}
                busy={useIsPending(Intent.Save)}
              >
                Save
              </PrimaryButton>

              <GhostLinkButton
                to={href('/workspace/:workspaceId/roles', { workspaceId })}
              >
                Cancel
              </GhostLinkButton>
            </Form.Actions>
          </Form.Section>
        </Form>

        <FormLayout>
          <Form.Section title="Actions">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Label</TableHeader>
                  <TableHeader>Type</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>{action.label}</TableCell>
                    <TableCell>{action.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <FormLayout.Actions>
              <SecondaryLinkButton
                to={href('/workspace/:workspaceId/roles/:roleId/add-action', {
                  workspaceId,
                  roleId,
                })}
              >
                Add new action
              </SecondaryLinkButton>
            </FormLayout.Actions>
          </Form.Section>
        </FormLayout>
      </Page.Main>

      <Outlet />
    </Page>
  )
}

export default EditRole
