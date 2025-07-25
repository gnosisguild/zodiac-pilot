import { authorizedAction } from '@/auth-server'
import { Page } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import { createRole, dbClient, getWorkspace } from '@zodiac/db'
import { getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect } from 'react-router'
import { Route } from './+types/create'
import { Intent } from './intents'

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

      await createRole(dbClient(), user, tenant, {
        label: getString(data, 'label'),
        workspaceId,
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

const CreateRole = () => {
  return (
    <Page>
      <Page.Header>Create new role</Page.Header>
      <Page.Main>
        <Form>
          <TextInput required label="Label" name="label" />

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
