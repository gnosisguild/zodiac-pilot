import { authorizedAction } from '@/auth-server'
import { dbClient, findWalletByAddress, getOrCreateWallet } from '@zodiac/db'
import { getHexString, getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import {
  AddressInput,
  Error,
  Form,
  Modal,
  PrimaryButton,
  TextInput,
} from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/add-wallet'

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      context: {
        auth: { user },
      },
      params: { workspaceId },
    }) => {
      const data = await request.formData()

      const label = getString(data, 'label')
      const address = getHexString(data, 'address')

      const existingWallet = await findWalletByAddress(
        dbClient(),
        user,
        address,
      )

      if (existingWallet != null) {
        return {
          error: `A wallet with this address already exists under the name "${existingWallet.label}".`,
        }
      }

      await getOrCreateWallet(dbClient(), user, { label, address })

      return redirect(href('/workspace/:workspaceId/profile', { workspaceId }))
    },
    { ensureSignedIn: true },
  )

const AddWallet = ({
  actionData,
  params: { workspaceId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      onClose={() =>
        navigate(href('/workspace/:workspaceId/profile', { workspaceId }))
      }
      title="Add Wallet"
    >
      <Form intent={Intent.AddWallet}>
        {actionData != null && (
          <Error title="Wallet already exists">{actionData.error}</Error>
        )}

        <TextInput required label="Label" name="label" placeholder="Label" />
        <AddressInput required label="Address" name="address" />

        <Modal.Actions>
          <PrimaryButton submit busy={useIsPending(Intent.AddWallet)}>
            Add
          </PrimaryButton>

          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default AddWallet

enum Intent {
  AddWallet = 'AddWallet',
}
