import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getRoleAction,
  getRoleActionAsset,
  updateAllowance,
} from '@zodiac/db'
import { AllowanceInterval } from '@zodiac/db/schema'
import { getEnumValue, getNumber } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, Modal, NumberInput, PrimaryButton, Select } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import { Route } from './+types/edit-asset'
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

      await updateAllowance(dbClient(), assetId, {
        allowance: BigInt(getNumber(data, 'allowance')),
        interval: getEnumValue(AllowanceInterval, data, 'interval'),
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
        )
      }
    >
      <Form>
        <NumberInput
          required
          label="Allowance"
          name="allowance"
          min={0}
          defaultValue={
            asset.allowance == null ? '' : asset.allowance.toString()
          }
        />

        <Select
          required
          label="Interval"
          name="interval"
          defaultValue={
            asset.interval == null
              ? { label: 'Monthly', value: AllowanceInterval.Monthly }
              : { label: capitalize(asset.interval), value: asset.interval }
          }
          options={[
            { label: 'Daily', value: AllowanceInterval.Daily },
            { label: 'Weekly', value: AllowanceInterval.Weekly },
            { label: 'Monthly', value: AllowanceInterval.Monthly },
            { label: 'Quarterly', value: AllowanceInterval.Quarterly },
            { label: 'Yearly', value: AllowanceInterval.Yearly },
          ]}
        />

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

const capitalize = (value: string) => {
  const [firstLetter, ...rest] = value

  return `${firstLetter.toUpperCase()}${rest.join('')}`
}
