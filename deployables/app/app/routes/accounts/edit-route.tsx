import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  findDefaultRoute,
  getRoute,
  setDefaultRoute,
  updateRouteLabel,
} from '@zodiac/db'
import { getBoolean, getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Checkbox, Form, Modal, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/edit-route'
import { Intent } from './intents'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { routeId, accountId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      invariantResponse(isUUID(routeId), '"routeId" is not a UUID')
      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const [route, defaultRoute] = await Promise.all([
        getRoute(dbClient(), routeId),
        findDefaultRoute(dbClient(), tenant, user, accountId),
      ])

      return {
        label: route.label ?? '',
        isDefault:
          defaultRoute == null ? false : defaultRoute.routeId === routeId,
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { routeId } }) {
        invariantResponse(isUUID(routeId), '"routeId" is not a UUID')

        const route = await getRoute(dbClient(), routeId)

        return route.tenantId === tenant.id
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      params: { routeId, accountId, workspaceId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      invariantResponse(isUUID(routeId), '"routeId" is not a UUID')
      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const data = await request.formData()

      const label = getString(data, 'label')
      const setAsDefault = getBoolean(data, 'defaultRoute')

      await dbClient().transaction(async (tx) => {
        const route = await getRoute(tx, routeId)
        const defaultRoute = await findDefaultRoute(tx, tenant, user, accountId)

        if (route.label !== label) {
          await updateRouteLabel(tx, routeId, label)
        }

        if (setAsDefault) {
          if (defaultRoute == null || defaultRoute.routeId !== routeId) {
            await setDefaultRoute(tx, tenant, user, route)
          }
        }
      })

      return redirect(
        href('/workspace/:workspaceId/accounts/:accountId/route/:routeId', {
          workspaceId,
          accountId,
          routeId,
        }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { routeId } }) {
        invariantResponse(isUUID(routeId), '"routeId" is not a UUID')

        const route = await getRoute(dbClient(), routeId)

        return route.tenantId === tenant.id
      },
    },
  )

const EditRoute = ({
  loaderData: { label, isDefault },
  params: { workspaceId, accountId, routeId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Edit route"
      onClose={() =>
        navigate(
          href('/workspace/:workspaceId/accounts/:accountId/route/:routeId', {
            workspaceId,
            accountId,
            routeId,
          }),
          { replace: true },
        )
      }
    >
      <Form replace>
        <TextInput
          label="Label"
          name="label"
          placeholder="Route label"
          defaultValue={label}
        />

        <Checkbox name="defaultRoute" defaultChecked={isDefault}>
          Use as default route
        </Checkbox>

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.EditRoute}
            busy={useIsPending(Intent.EditRoute)}
          >
            Update
          </PrimaryButton>
          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default EditRoute
