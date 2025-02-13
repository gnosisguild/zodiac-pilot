import { MinimumVersion, Page, useConnected } from '@/components'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import { Address, Form, GhostButton, Info, Table } from '@zodiac/ui'
import { useEffect, useState } from 'react'

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

    const handleRoutes = (event: MessageEvent<CompanionAppMessage>) => {
      if (event.data.type !== CompanionAppMessageType.LIST_ROUTES) {
        return
      }

      setRoutes(event.data.routes)
    }

    window.addEventListener('message', handleRoutes)

    window.postMessage({
      type: CompanionAppMessageType.REQUEST_ROUTES,
    } satisfies CompanionAppMessage)

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
        <div className="flex justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <Form>
            <GhostButton submit size="tiny">
              Edit
            </GhostButton>
          </Form>
        </div>
      </Table.Td>
    </Table.Tr>
  )
}
