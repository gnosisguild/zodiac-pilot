import { Page } from '@/components'
import {
  dbClient,
  getAccount,
  getActiveRoute,
  getWallets,
  updateAccount,
} from '@/db'
import { authKitAction, authKitLoader } from '@/workOS/server'
import { getString } from '@zodiac/form-data'
import { AddressSelect, Form, PrimaryButton, TextInput } from '@zodiac/ui'
import { prefixAddress, queryInitiators } from 'ser-kit'
import type { Route } from './+types/edit'

export const loader = (args: Route.LoaderArgs) =>
  authKitLoader(
    args,
    async ({
      params: { accountId },
      context: {
        auth: { user },
      },
    }) => {
      const account = await getAccount(dbClient(), accountId)
      const wallets = await getWallets(dbClient(), user.id)
      const initiators = await queryInitiators(
        prefixAddress(account.chainId, account.address),
      )
      const activeRoute = await getActiveRoute(dbClient(), user, account.id)

      return {
        label: account.label || '',
        initiator:
          activeRoute == null ? undefined : activeRoute.route.wallet.address,
        initiators: wallets.filter((wallet) =>
          initiators.includes(wallet.address),
        ),
      }
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

const EditAccount = ({
  loaderData: { label, initiators, initiator },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Edit Account</Page.Header>
      <Page.Main>
        <Form>
          <TextInput label="Label" name="label" defaultValue={label} />

          <AddressSelect
            isMulti={false}
            label="Pilot Signer"
            defaultValue={initiator}
            options={initiators.map(({ address, label }) => ({
              address,
              label,
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

export default EditAccount
