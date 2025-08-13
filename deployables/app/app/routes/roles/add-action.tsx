import { authorizedAction, authorizedLoader } from '@/auth-server'
import { getTokens, getVerifiedTokens, TokenSelect } from '@/token-list'
import { invariantResponse } from '@epic-web/invariant'
import {
  createRoleAction,
  createRoleActionAssets,
  dbClient,
  getActivatedAccounts,
  getRole,
} from '@zodiac/db'
import { RoleActionType } from '@zodiac/db/schema'
import { getPrefixedAddressList, getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, Modal, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import { Route } from './+types/add-action'
import { Intent } from './intents'
import { RoleActionTypeSelect } from './RoleActionTypeSelect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { roleId } }) => {
      invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

      const activatedAccounts = await getActivatedAccounts(dbClient(), {
        roleId,
      })

      return {
        tokens: await getTokens(
          activatedAccounts.map(({ chainId }) => chainId),
        ),
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { roleId, workspaceId } }) {
        invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

        const role = await getRole(dbClient(), roleId)

        return role.tenantId === tenant.id && role.workspaceId === workspaceId
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      params: { roleId, workspaceId },
      context: {
        auth: { user },
      },
    }) => {
      invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

      const data = await request.formData()
      const role = await getRole(dbClient(), roleId)

      const label = getString(data, 'label')

      await dbClient().transaction(async (tx) => {
        const action = await createRoleAction(tx, role, user, {
          label,
          type: RoleActionType.Swapper,
        })

        const sellTokens = getPrefixedAddressList(data, 'sell')
        const buyTokens = getPrefixedAddressList(data, 'buy')

        const [verifiedTokensToSell, verifiedTokensToBuy] = await Promise.all([
          getVerifiedTokens(sellTokens),
          getVerifiedTokens(buyTokens),
        ])

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
      async hasAccess({ tenant, params: { workspaceId, roleId } }) {
        invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

        const role = await getRole(dbClient(), roleId)

        return role.tenantId === tenant.id && role.workspaceId === workspaceId
      },
    },
  )

const AddAction = ({
  params: { workspaceId, roleId },
  loaderData: { tokens },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      size="2xl"
      title="Add action"
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
        <TextInput required label="Action label" name="label" />

        <RoleActionTypeSelect />

        <div className="grid grid-cols-2 gap-4">
          <TokenSelect
            tokens={tokens}
            label="Sell"
            name="sell"
            placeholder="Select tokens to sell"
          />
          <TokenSelect
            tokens={tokens}
            label="Buy"
            name="buy"
            placeholder="Select tokens to buy"
          />
        </div>

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.AddAction}
            busy={useIsPending(Intent.AddAction)}
          >
            Add
          </PrimaryButton>
          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default AddAction
