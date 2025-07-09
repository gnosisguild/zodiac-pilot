import { authorizedAction } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getRoute, removeRoute } from '@zodiac/db'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { InlineForm, Modal, PrimaryButton } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/remove-route'
import { Intent } from './intents'

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ params: { routeId, workspaceId, accountId } }) => {
      invariantResponse(isUUID(routeId), '"routeId" is not a UUID')

      await removeRoute(dbClient(), routeId)

      return redirect(
        href('/workspace/:workspaceId/accounts/:accountId', {
          workspaceId,
          accountId,
        }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, user, params: { routeId } }) {
        invariantResponse(isUUID(routeId), '"routeId" is not a UUID')

        const route = await getRoute(dbClient(), routeId)

        return route.tenantId === tenant.id && route.userId === user.id
      },
    },
  )

const RemoveRoute = ({
  params: { workspaceId, accountId, routeId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Remove route"
      description="Are you sure you want to remove this route? This action cannot be undone."
      onClose={() =>
        navigate(
          href('/workspace/:workspaceId/accounts/:accountId/route/:routeId', {
            workspaceId,
            accountId,
            routeId,
          }),
        )
      }
    >
      <Modal.Actions>
        <InlineForm>
          <PrimaryButton
            submit
            style="critical"
            intent={Intent.RemoveRoute}
            busy={useIsPending(Intent.RemoveRoute)}
          >
            Remove
          </PrimaryButton>
        </InlineForm>

        <Modal.CloseAction>Cancel</Modal.CloseAction>
      </Modal.Actions>
    </Modal>
  )
}

export default RemoveRoute
