import { Route, Routes } from '@/routes-ui'
import { parseRouteData } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { Modal } from '@zodiac/ui'
import { useNavigate } from 'react-router'
import { queryRoutes, unprefixAddress } from 'ser-kit'
import type { Route as RouteType } from './+types/update-route'

export const loader = async ({ params }: RouteType.LoaderArgs) => {
  const route = parseRouteData(params.route)

  invariantResponse(
    route.initiator != null,
    'Route does not specify an initiator',
  )

  return {
    routes: await queryRoutes(unprefixAddress(route.initiator), route.avatar),
  }
}

const UpdateRoute = ({ loaderData: { routes } }: RouteType.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      closeLabel="Cancel"
      onClose={() => {
        navigate('..')
      }}
      open
      title="Update route"
    >
      <Routes>
        {routes.map((route) => (
          <Route key={route.id} id={route.id}></Route>
        ))}
      </Routes>

      <Modal.Actions></Modal.Actions>
    </Modal>
  )
}

export default UpdateRoute
