import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Token } from '@/components'
import { Chain } from '@/routes-ui'
import { getAssets, getVerifiedAssets } from '@/token-list'
import { invariantResponse } from '@epic-web/invariant'
import { getChainId } from '@zodiac/chains'
import {
  createRoleActionAssets,
  dbClient,
  getActivatedAccounts,
  getRoleAction,
} from '@zodiac/db'
import {
  getEnumValue,
  getOptionalInt,
  getPrefixedAddressList,
} from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { AllowanceInterval, isUUID } from '@zodiac/schema'
import {
  Form,
  Modal,
  MultiSelect,
  NumberInput,
  PrimaryButton,
} from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import { Route } from './+types/add-asset'
import { AllowanceIntervalSelect } from './AllowanceIntervalSelect'
import { AssetPermission, SellBuyPermission } from './AssetPermission'
import { Intent } from './intents'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { roleId } }) => {
      invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

      const activatedAccounts = await getActivatedAccounts(dbClient(), {
        roleId,
      })

      return {
        assets: await getAssets(
          activatedAccounts.map(({ chainId }) => chainId),
        ),
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { workspaceId, roleId, actionId } }) {
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
    async ({ request, params: { actionId, workspaceId, roleId } }) => {
      invariantResponse(isUUID(actionId), '"actionId" is not a UUID')

      const data = await request.formData()

      const assets = getPrefixedAddressList(data, 'assets')
      const verifiedAssets = await getVerifiedAssets(assets)

      const action = await getRoleAction(dbClient(), actionId)

      const allowanceAmount = getOptionalInt(data, 'allowance')
      const permission = getEnumValue(SellBuyPermission, data, 'permission')

      await createRoleActionAssets(
        dbClient(),
        action,
        {
          allowBuy:
            permission === SellBuyPermission.Buy ||
            permission === SellBuyPermission.SellAndBuy,
          allowSell:
            permission === SellBuyPermission.Sell ||
            permission === SellBuyPermission.SellAndBuy,
          allowance:
            allowanceAmount == null
              ? undefined
              : {
                  allowance: BigInt(allowanceAmount),
                  interval: getEnumValue(AllowanceInterval, data, 'interval'),
                },
        },
        verifiedAssets,
      )

      return redirect(
        href('/workspace/:workspaceId/roles/:roleId', { workspaceId, roleId }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { workspaceId, roleId, actionId } }) {
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

const AddAsset = ({
  loaderData: { assets },
  params: { workspaceId, roleId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Add assets"
      description="Add one ore more assets to this action."
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
        <MultiSelect
          required
          name="assets"
          label="Assets"
          placeholder="Select one or more assets"
          options={Object.values(assets).map((asset) => ({
            label: asset.symbol,
            value: asset.address,
          }))}
        >
          {({ data: { value, label } }) => {
            const token = assets[value]

            return (
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <Token logo={token.logoURI} />
                  {label}
                </span>

                <span aria-hidden>
                  <Chain chainId={getChainId(value)} />
                </span>
              </div>
            )
          }}
        </MultiSelect>

        <AssetPermission required label="Permission" name="permission" />

        <div className="grid grid-cols-2 gap-4">
          <NumberInput label="Allowance" name="allowance" min={0} />

          <AllowanceIntervalSelect label="Interval" name="interval" />
        </div>

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.AddAsset}
            busy={useIsPending(Intent.AddAsset)}
          >
            Add
          </PrimaryButton>
          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default AddAsset
