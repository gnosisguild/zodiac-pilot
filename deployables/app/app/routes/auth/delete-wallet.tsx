import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  deleteWallet,
  getAccountsByWalletId,
  getWallet,
} from '@zodiac/db'
import { useAfterSubmit, useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Divider, Form, Modal, PrimaryButton } from '@zodiac/ui'
import { useId } from 'react'
import { href, useNavigate } from 'react-router'
import type { Route } from './+types/delete-wallet'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { walletId },
      context: {
        auth: { tenant },
      },
    }) => {
      invariantResponse(isUUID(walletId), 'Wallet ID is not a UUID')

      return {
        wallet: await getWallet(dbClient(), walletId),
        accounts: await getAccountsByWalletId(dbClient(), tenant, walletId),
      }
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

const DeleteWallet = ({
  loaderData: { wallet, accounts },
  params: { workspaceId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  const accountListId = useId()

  useAfterSubmit(Intent.Delete, () =>
    navigate(href('/workspace/:workspaceId/profile', { workspaceId })),
  )

  return (
    <Modal
      open
      title="Remove wallet"
      onClose={() =>
        navigate(href('/workspace/:workspaceId/profile', { workspaceId }))
      }
    >
      <div className="flex flex-col gap-4">
        <p>
          Are you sure that you want to remove the wallet{' '}
          <strong>{wallet.label}</strong>?
        </p>

        <Divider />

        <div className="text-sm">
          {accounts.length > 0 ? (
            <>
              <h2 id={accountListId} className="mb-2 font-semibold">
                Used to access these accounts
              </h2>
              <ul
                aria-labelledby={accountListId}
                className="list-inside list-disc"
              >
                {accounts.map((account) => (
                  <li key={account.id} aria-label={account.label ?? undefined}>
                    {account.label}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <strong>Not used in any accounts</strong>
          )}
        </div>
      </div>

      <Modal.Actions>
        <Form>
          <PrimaryButton
            submit
            busy={useIsPending()}
            style="critical"
            intent={Intent.Delete}
          >
            Remove
          </PrimaryButton>
        </Form>

        <Modal.CloseAction>Cancel</Modal.CloseAction>
      </Modal.Actions>
    </Modal>
  )
}

export default DeleteWallet

enum Intent {
  Delete = 'Delete',
}
