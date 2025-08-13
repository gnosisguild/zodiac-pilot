import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Token } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getRoleAction,
  getRoleActionAsset,
  removeAllowance,
  updateAllowance,
  updatePermissions,
} from '@zodiac/db'
import { getEnumValue, getNumber, getOptionalInt } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { AllowanceInterval, isUUID } from '@zodiac/schema'
import {
  Form,
  InputLayout,
  Labeled,
  Modal,
  NumberInput,
  PrimaryButton,
} from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import { prefixAddress } from 'ser-kit'
import { Route } from './+types/edit-asset'
import { AllowanceIntervalSelect } from './AllowanceIntervalSelect'
import {
  AssetPermission,
  getPermission,
  SellBuyPermission,
} from './AssetPermission'
import { Intent } from './intents'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { assetId } }) => {
      invariantResponse(isUUID(assetId), '"assetId" is not a UUID')

      return { asset: await getRoleActionAsset(dbClient(), assetId) }
    },
    {
      ensureSignedIn: true,
      async hasAccess({
        tenant,
        params: { workspaceId, roleId, actionId, assetId },
      }) {
        invariantResponse(isUUID(assetId), '"assetId" is not a UUID')
        invariantResponse(isUUID(actionId), '"actionId" is not a UUID')

        const asset = await getRoleActionAsset(dbClient(), assetId)
        const action = await getRoleAction(dbClient(), actionId)

        return (
          asset.tenantId === tenant.id &&
          asset.roleActionId === actionId &&
          asset.workspaceId === workspaceId &&
          action.roleId === roleId
        )
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ request, params: { workspaceId, roleId, assetId } }) => {
      invariantResponse(isUUID(assetId), '"assetId" is not a UUID')

      const data = await request.formData()

      await dbClient().transaction(async (tx) => {
        const allowanceAmount = getOptionalInt(data, 'allowance')

        if (allowanceAmount == null) {
          await removeAllowance(tx, assetId)
        } else {
          await updateAllowance(tx, assetId, {
            allowance: BigInt(getNumber(data, 'allowance')),
            interval: getEnumValue(AllowanceInterval, data, 'interval'),
          })
        }

        const permission = getEnumValue(SellBuyPermission, data, 'permission')

        await updatePermissions(tx, assetId, {
          allowBuy:
            permission === SellBuyPermission.Buy ||
            permission === SellBuyPermission.SellAndBuy,
          allowSell:
            permission === SellBuyPermission.Sell ||
            permission === SellBuyPermission.SellAndBuy,
        })
      })

      return redirect(
        href('/workspace/:workspaceId/roles/:roleId', { workspaceId, roleId }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({
        tenant,
        params: { workspaceId, roleId, actionId, assetId },
      }) {
        invariantResponse(isUUID(assetId), '"assetId" is not a UUID')
        invariantResponse(isUUID(actionId), '"actionId" is not a UUID')

        const asset = await getRoleActionAsset(dbClient(), assetId)
        const action = await getRoleAction(dbClient(), actionId)

        return (
          asset.tenantId === tenant.id &&
          asset.roleActionId === actionId &&
          asset.workspaceId === workspaceId &&
          action.roleId === roleId
        )
      },
    },
  )

const EditAsset = ({
  loaderData: { asset },
  params: { roleId, workspaceId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Edit asset"
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
        <Labeled label="Asset">
          <InputLayout disabled>
            <div className="px-4 py-2">
              <Token
                contractAddress={prefixAddress(asset.chainId, asset.address)}
              >
                {asset.symbol}
              </Token>
            </div>
          </InputLayout>
        </Labeled>

        <AssetPermission
          required
          label="Permission"
          name="permission"
          defaultValue={getPermission(asset)}
        />

        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Allowance"
            name="allowance"
            min={0}
            defaultValue={
              asset.allowance == null ? '' : asset.allowance.toString()
            }
          />

          <AllowanceIntervalSelect
            label="Interval"
            name="interval"
            defaultValue={
              asset.interval == null
                ? AllowanceInterval.Monthly
                : asset.interval
            }
          />
        </div>

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.EditAsset}
            busy={useIsPending(Intent.EditAsset)}
          >
            Update
          </PrimaryButton>

          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default EditAsset
