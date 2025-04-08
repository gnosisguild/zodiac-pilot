import { Page } from '@/components'
import { dbClient, getAccount, updateAccount } from '@/db'
import { authKitAction, authKitLoader } from '@/workOS/server'
import { getString } from '@zodiac/form-data'
import { Form, PrimaryButton, TextInput } from '@zodiac/ui'
import type { Route } from './+types/edit'

export const loader = (args: Route.LoaderArgs) =>
  authKitLoader(
    args,
    async ({ params: { accountId } }) => {
      const account = await getAccount(dbClient(), accountId)

      return { label: account.label || '' }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ user, params: { accountId } }) {
        const account = await getAccount(dbClient(), accountId)

        return account.createdById === user.id
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authKitAction(
    args,
    async ({ request, params: { accountId } }) => {
      const data = await request.formData()

      await updateAccount(dbClient(), accountId, {
        label: getString(data, 'label'),
      })

      return null
    },
    {
      ensureSignedIn: true,
      async hasAccess({ user, params: { accountId } }) {
        const account = await getAccount(dbClient(), accountId)

        return account.createdById === user.id
      },
    },
  )

const EditAccount = ({ loaderData: { label } }: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Edit Account</Page.Header>
      <Page.Main>
        <Form>
          <TextInput label="Label" name="label" defaultValue={label} />
          <Form.Actions>
            <PrimaryButton submit>Save</PrimaryButton>
          </Form.Actions>
        </Form>
      </Page.Main>
    </Page>
  )
}

export default EditAccount
