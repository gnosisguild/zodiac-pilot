import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, deleteWallet, getWallet } from '@zodiac/db'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, GhostButton, Modal, PrimaryButton } from '@zodiac/ui'
import { href, useNavigate } from 'react-router'
import type { Route } from './+types/delete-wallet'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { walletId } }) => {
      invariantResponse(isUUID(walletId), 'Wallet ID is not a UUID')

      return { wallet: await getWallet(dbClient(), walletId) }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ user, params: { walletId } }) {
        invariantResponse(isUUID(walletId), 'Wallet ID is not a UUID')

        const wallet = await getWallet(dbClient(), walletId)

        return wallet.belongsToId === user.id
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      params: { walletId },
      context: {
        auth: { user },
      },
    }) => {
      invariantResponse(isUUID(walletId), 'Wallet ID is not a UUID')

      await deleteWallet(dbClient(), user, walletId)

      return null
    },
    {
      ensureSignedIn: true,
      async hasAccess({ user, params: { walletId } }) {
        invariantResponse(isUUID(walletId), 'Wallet ID is not a UUID')

        const wallet = await getWallet(dbClient(), walletId)

        return wallet.belongsToId === user.id
      },
    },
  )

const DeleteWallet = ({ loaderData: { wallet } }: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Remove wallet"
      onClose={() => navigate(href('/profile'))}
    >
      Are you sure that you want to remove the wallet{' '}
      <strong>{wallet.label}</strong>?
      <Modal.Actions>
        <Form>
          <PrimaryButton submit busy={useIsPending()} style="critical">
            Remove
          </PrimaryButton>
        </Form>

        <GhostButton onClick={() => navigate(href('/profile'))}>
          Cancel
        </GhostButton>
      </Modal.Actions>
    </Modal>
  )
}

export default DeleteWallet
