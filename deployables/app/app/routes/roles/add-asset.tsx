import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getRoleAction } from '@zodiac/db'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, Modal, MultiSelect, PrimaryButton } from '@zodiac/ui'
import { href, useNavigate } from 'react-router'
import { Route } from './+types/add-asset'
import { Intent } from './intents'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(args, async () => {}, {
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
  })

const AddAsset = ({
  params: { workspaceId, roleId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Add assets"
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
        <MultiSelect label="Assets" />

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
