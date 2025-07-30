import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getAccounts,
  getActivatedAccounts,
  getRole,
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
  MultiSelect,
  PrimaryButton,
  SecondaryLinkButton,
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

      const [members, activeAccounts, role, users, accounts] =
        await Promise.all([
          getRoleMembers(dbClient(), { roleId }),
          getActivatedAccounts(dbClient(), { roleId }),
          getRole(dbClient(), roleId),
          getUsers(dbClient(), { tenantId: tenant.id }),
          getAccounts(dbClient(), { workspaceId }),
        ])

      return {
        role,
        users,
        accounts,
        activeAccounts: roleId in activeAccounts ? activeAccounts[roleId] : [],
        members: roleId in members ? members[roleId] : [],
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
  loaderData: { role, users, members, accounts, activeAccounts },
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
            <TextInput label="Label" name="label" defaultValue={role.label} />

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
            </Form.Actions>
          </Form.Section>
        </Form>

        <FormLayout>
          <Form.Section title="Actions"></Form.Section>

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
        </FormLayout>
      </Page.Main>

      <Outlet />
    </Page>
  )
}

export default EditRole
