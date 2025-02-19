import { MinimumVersion, OnlyConnected, Page } from '@/components'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { encode, type ExecutionRoute } from '@zodiac/schema'
import { Address, GhostButton, Info, Table } from '@zodiac/ui'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { Route } from './+types/list-routes'

const ListRoutes = () => (
  <Page fullWidth>
    <Page.Header>Routes</Page.Header>

    <Page.Main>
      <MinimumVersion
        version="3.4.0"
        fallback={
          <Info>
            To edit a route open the list of all routes in the Pilot extension
            and click "Edit".
          </Info>
        }
      >
        <OnlyConnected>
          <Routes />
        </OnlyConnected>
      </MinimumVersion>
    </Page.Main>
  </Page>
)

export default ListRoutes

const Routes = () => {
  const [routes, setRoutes] = useState<ExecutionRoute[]>([])

  useEffect(() => {
    return companionRequest(
      {
        type: CompanionAppMessageType.REQUEST_ROUTES,
      },
      (response) => setRoutes(response.routes),
    )
  }, [])

  return (
    <Table>
      <Table.THead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Initiator</Table.Th>
          <Table.Th>Avatar</Table.Th>
          <Table.Th className="w-1/10" />
        </Table.Tr>
      </Table.THead>

      <Table.TBody>
        {routes.map((route) => (
          <Route key={route.id} route={route} />
        ))}
      </Table.TBody>
    </Table>
  )
}

type RouteProps = { route: ExecutionRoute }

const Route = ({ route }: RouteProps) => {
  return (
    <Table.Tr>
      <Table.Td>{route.label}</Table.Td>
      <Table.Td>
        {route.initiator && <Address shorten>{route.initiator}</Address>}
      </Table.Td>
      <Table.Td>
        <Address shorten>{route.avatar}</Address>
      </Table.Td>
      <Table.Td align="right">
        <Edit routeId={route.id} />
      </Table.Td>
    </Table.Tr>
  )
}

const Edit = ({ routeId }: { routeId: string }) => {
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (submitting === false) {
      return
    }

    return companionRequest(
      {
        type: CompanionAppMessageType.REQUEST_ROUTE,
        routeId,
      },
      (response) => navigate(`/edit/${encode(response.route)}`),
    )
  }, [routeId, navigate, submitting])

  return (
    <div
      className={classNames(
        'flex justify-center transition-opacity group-hover:opacity-100',
        submitting ? 'opacity-100' : 'opacity-0',
      )}
    >
      <GhostButton
        size="tiny"
        busy={submitting}
        onClick={() => setSubmitting(true)}
      >
        Edit
      </GhostButton>
    </div>
  )
}
