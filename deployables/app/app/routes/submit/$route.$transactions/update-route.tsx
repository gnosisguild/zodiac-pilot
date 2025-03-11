import { useIsPending } from '@/hooks'
import { Route, routeId, Routes, Waypoint, Waypoints } from '@/routes-ui'
import { parseRouteData } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { getString } from '@zodiac/form-data'
import { encode } from '@zodiac/schema'
import { Form, GhostButton, Modal, PrimaryButton } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import { queryRoutes, unprefixAddress } from 'ser-kit'
import type { Route as RouteType } from './+types/update-route'

export const loader = async ({ params }: RouteType.LoaderArgs) => {
  const route = parseRouteData(params.route)

  invariantResponse(
    route.initiator != null,
    'Route does not specify an initiator',
  )

  return {
    selectedRouteId: routeId(route),
    routes: await queryRoutes(unprefixAddress(route.initiator), route.avatar),
  }
}

export const action = async ({ request, params }: RouteType.ActionArgs) => {
  const data = await request.formData()

  const currentRoute = parseRouteData(params.route)

  invariantResponse(
    currentRoute.initiator != null,
    'Route does not specify an initiator',
  )

  const routes = await queryRoutes(
    unprefixAddress(currentRoute.initiator),
    currentRoute.avatar,
  )

  const newRouteId = getString(data, 'routeId')
  const newRoute = routes.find((route) => routeId(route) === newRouteId)

  invariantResponse(
    newRoute != null,
    `Could not find route with id "${newRouteId}"`,
  )

  return redirect(
    href('/submit/:route/:transactions', {
      route: encode(newRoute),
      transactions: params.transactions,
    }),
  )
}

const UpdateRoute = ({
  loaderData: { routes, selectedRouteId },
}: RouteType.ComponentProps) => {
  const navigate = useNavigate()
  const isSubmitting = useIsPending()

  return (
    <Modal
      open
      closeLabel="Cancel"
      onClose={() => {
        navigate('..')
      }}
      title="Update route"
    >
      <Form>
        <Routes defaultValue={selectedRouteId}>
          {routes.map((route) => (
            <Route key={route.id} id={routeId(route)} name="routeId">
              <Waypoints>
                {route.waypoints.map((waypoint) => (
                  <Waypoint
                    key={waypoint.account.prefixedAddress}
                    account={waypoint.account}
                  />
                ))}
              </Waypoints>
            </Route>
          ))}
        </Routes>

        <Modal.Actions>
          <PrimaryButton submit busy={isSubmitting}>
            Use
          </PrimaryButton>

          <GhostButton onClick={() => navigate('..')}>Cancel</GhostButton>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default UpdateRoute
