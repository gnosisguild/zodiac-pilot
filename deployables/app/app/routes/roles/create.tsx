import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import {
  addRoleMembers,
  createRole,
  dbClient,
  getUsers,
  getWorkspace,
} from '@zodiac/db'
import { getString, getUUIDList } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, MultiSelect, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect } from 'react-router'
import { Route } from './+types/create'
import { Intent } from './intents'

export const loader = async (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
    }) => {
      return { users: await getUsers(dbClient(), { tenantId: tenant.id }) }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { workspaceId } }) {
        invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID')

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
      params: { workspaceId },
      context: {
        auth: { user, tenant },
      },
    }) => {
      const data = await request.formData()
      invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID')

      await dbClient().transaction(async (tx) => {
        const role = await createRole(tx, user, tenant, {
          label: getString(data, 'label'),
          workspaceId,
        })

        const members = getUUIDList(data, 'members')

        await addRoleMembers(tx, role, members)
      })

      return redirect(href('/workspace/:workspaceId/roles', { workspaceId }))
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { workspaceId } }) {
        invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID')

        const workspace = await getWorkspace(dbClient(), workspaceId)

        return workspace.tenantId === tenant.id
      },
    },
  )

const CreateRole = ({ loaderData: { users } }: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Create new role</Page.Header>
      <Page.Main>
        <Form>
          <TextInput required label="Label" name="label" />

          <MultiSelect
            label="Members"
            name="members"
            options={users.map((user) => ({
              label: user.fullName,
              value: user.id,
            }))}
          />

          <Form.Actions>
            <PrimaryButton
              intent={Intent.Create}
              busy={useIsPending(Intent.Create)}
              submit
            >
              Create
            </PrimaryButton>
          </Form.Actions>
        </Form>
      </Page.Main>
    </Page>
  )
}

export default CreateRole
