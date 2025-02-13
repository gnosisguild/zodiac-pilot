import { MinimumVersion, Page, useConnected } from '@/components'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'
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
        <Routes />
      </MinimumVersion>
    </Page.Main>
  </Page>
)

export default ListRoutes

const Routes = () => {
  const connected = useConnected()
  const [routes, setRoutes] = useState<ExecutionRoute[]>([])

  useEffect(() => {
    if (connected === false) {
      return
    }

    const handleRoutes = (event: MessageEvent<CompanionResponseMessage>) => {
      if (event.data.type !== CompanionResponseMessageType.LIST_ROUTES) {
        return
      }

      setRoutes(event.data.routes)
    }

    window.addEventListener('message', handleRoutes)

    window.postMessage(
      {
        type: CompanionAppMessageType.REQUEST_ROUTES,
      } satisfies CompanionAppMessage,
      '*',
    )

    return () => {
      window.removeEventListener('message', handleRoutes)
    }
  }, [connected])

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
        {route.initiator && <Address>{route.initiator}</Address>}
      </Table.Td>
      <Table.Td>
        <Address>{route.avatar}</Address>
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
  const connected = useConnected()

  useEffect(() => {
    if (submitting === false) {
      return
    }

    const handleRoute = (event: MessageEvent<CompanionResponseMessage>) => {
      if (event.data.type !== CompanionResponseMessageType.PROVIDE_ROUTE) {
        return
      }

      navigate(`/edit-route/${encode(event.data.route)}`)
    }

    window.addEventListener('message', handleRoute)

    window.postMessage(
      {
        type: CompanionAppMessageType.REQUEST_ROUTE,
        routeId,
      } satisfies CompanionAppMessage,
      '*',
    )

    return () => {
      window.removeEventListener('message', handleRoute)
    }
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
        disabled={!connected}
        onClick={() => setSubmitting(true)}
      >
        Edit
      </GhostButton>
    </div>
  )
}
