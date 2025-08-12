import { authorizedAction, authorizedLoader } from '@/auth-server'
import { getTokens, getVerifiedTokens, TokenSelect } from '@/token-list'
import { invariantResponse } from '@epic-web/invariant'
import {
  createRoleActionAssets,
  dbClient,
  getActivatedAccounts,
  getRoleAction,
  getRoleActionAssets,
  removeRoleActionAssets,
  updateRoleAction,
} from '@zodiac/db'
import { getPrefixedAddressList, getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, Modal, PrimaryButton } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import { prefixAddress } from 'ser-kit'
import { Route } from './+types/edit-action'
import { ActionLabelInput } from './ActionLabelInput'
import { Intent } from './intents'
import { RoleActionTypeSelect } from './RoleActionTypeSelect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { actionId } }) => {
      invariantResponse(isUUID(actionId), '"actionId" is not a UUID')

      const action = await getRoleAction(dbClient(), actionId)

      const activeAccounts = await getActivatedAccounts(dbClient(), {
        roleId: action.roleId,
      })

      const assets = await getRoleActionAssets(dbClient(), { actionId })

      const assetsToSell = assets
        .filter((asset) => asset.allowSell)
        .map((asset) => prefixAddress(asset.chainId, asset.address))
      const assetsToBuy = assets
        .filter((asset) => asset.allowBuy)
        .map((asset) => prefixAddress(asset.chainId, asset.address))

      return {
        action,
        assetsToSell,
        assetsToBuy,
        tokens: await getTokens(activeAccounts.map(({ chainId }) => chainId)),
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { workspaceId, roleId, actionId }, tenant }) {
        invariantResponse(isUUID(actionId), '"actionId" is not a UUID')

        const action = await getRoleAction(dbClient(), actionId)

        return (
          action.tenantId === tenant.id &&
          action.workspaceId === workspaceId &&
          action.roleId === roleId
        )
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ request, params: { workspaceId, roleId, actionId } }) => {
      const data = await request.formData()

      invariantResponse(isUUID(actionId), '"actionId" is not a UUID')

      const action = await getRoleAction(dbClient(), actionId)

      await dbClient().transaction(async (tx) => {
        const label = getString(data, 'label')

        if (action.label !== label) {
          await updateRoleAction(tx, action, {
            label,
          })
        }

        const sellTokens = getPrefixedAddressList(data, 'sell')
        const buyTokens = getPrefixedAddressList(data, 'buy')

        const [verifiedTokensToSell, verifiedTokensToBuy] = await Promise.all([
          getVerifiedTokens(sellTokens),
          getVerifiedTokens(buyTokens),
        ])

        await removeRoleActionAssets(tx, action.id)

        await createRoleActionAssets(tx, action, {
          sell: verifiedTokensToSell,
          buy: verifiedTokensToBuy,
        })
      })

      return redirect(
        href('/workspace/:workspaceId/roles/:roleId', { workspaceId, roleId }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { workspaceId, roleId, actionId }, tenant }) {
        invariantResponse(isUUID(actionId), '"actionId" is not a UUID')

        const action = await getRoleAction(dbClient(), actionId)

        return (
          action.tenantId === tenant.id &&
          action.workspaceId === workspaceId &&
          action.roleId === roleId
        )
      },
    },
  )

const EditAction = ({
  loaderData: { action, tokens, assetsToBuy, assetsToSell },
  params: { workspaceId, roleId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      size="2xl"
      title="Edit action"
      onClose={() =>
        navigate(
          href('/workspace/:workspaceId/roles/:roleId', {
            workspaceId,
            roleId,
          }),
          { replace: true },
        )
      }
    >
      <Form replace>
        <ActionLabelInput
          required
          label="Action label"
          name="label"
          defaultValue={action.label}
          keyValue={action.key}
        />

        <RoleActionTypeSelect />

        <div className="grid grid-cols-2 gap-4">
          <TokenSelect
            label="Swap from"
            name="sell"
            tokens={tokens}
            defaultValue={assetsToSell}
            placeholder="Select tokens to sell"
          />
          <TokenSelect
            label="Swap for"
            name="buy"
            tokens={tokens}
            defaultValue={assetsToBuy}
            placeholder="Select tokens to buy"
          />
        </div>

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.EditAction}
            busy={useIsPending(Intent.EditAction)}
          >
            Update
          </PrimaryButton>
          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default EditAction
