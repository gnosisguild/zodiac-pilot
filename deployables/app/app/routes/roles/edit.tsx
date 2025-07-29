import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import {
  addRoleMembers,
  dbClient,
  getRole,
  getUsers,
  updateRole,
} from '@zodiac/db'
import { getString, getUUIDList } from '@zodiac/form-data'
import { isUUID } from '@zodiac/schema'
import { Form, MultiSelect, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect } from 'react-router'
import { Route } from './+types/edit'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { roleId },
      context: {
        auth: { tenant },
      },
    }) => {
      invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

      return {
        role: await getRole(dbClient(), roleId),
        users: await getUsers(dbClient(), { tenantId: tenant.id }),
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

        await addRoleMembers(tx, role, getUUIDList(data, 'members'))
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

const EditRole = ({ loaderData: { role, users } }: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Edit role</Page.Header>
      <Page.Main>
        <Form>
          <TextInput label="Label" name="label" defaultValue={role.label} />

          <MultiSelect
            label="Members"
            name="members"
            options={users.map((user) => ({
              label: user.fullName,
              value: user.id,
            }))}
          />

          <Form.Actions>
            <PrimaryButton submit>Save</PrimaryButton>
          </Form.Actions>
        </Form>
      </Page.Main>
    </Page>
  )
}

export default EditRole
