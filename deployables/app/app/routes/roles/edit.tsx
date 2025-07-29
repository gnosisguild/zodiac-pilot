import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getRole, updateRole } from '@zodiac/db'
import { getString } from '@zodiac/form-data'
import { isUUID } from '@zodiac/schema'
import { FormLayout, InlineForm, PrimaryButton, TextInput } from '@zodiac/ui'
import { useId } from 'react'
import { href, redirect } from 'react-router'
import { Route } from './+types/edit'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { roleId } }) => {
      invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

      return { role: await getRole(dbClient(), roleId) }
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

      await updateRole(dbClient(), roleId, { label: getString(data, 'label') })

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

const EditRole = ({ loaderData: { role } }: Route.ComponentProps) => {
  const formId = useId()

  return (
    <Page>
      <Page.Header>Edit role</Page.Header>
      <Page.Main>
        <FormLayout>
          <TextInput
            form={formId}
            label="Label"
            name="label"
            defaultValue={role.label}
          />

          <FormLayout.Actions>
            <InlineForm id={formId}>
              <PrimaryButton submit>Save</PrimaryButton>
            </InlineForm>
          </FormLayout.Actions>
        </FormLayout>
      </Page.Main>
    </Page>
  )
}

export default EditRole
