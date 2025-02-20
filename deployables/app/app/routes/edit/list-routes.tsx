import { MinimumVersion, OnlyConnected, Page } from '@/components'
import { useIsPending } from '@/hooks'
import { getString } from '@zodiac/form-data'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { encode, type ExecutionRoute } from '@zodiac/schema'
import { Address, Form, GhostButton, Info, Table } from '@zodiac/ui'
import classNames from 'classnames'
import { type PropsWithChildren } from 'react'
import { redirect } from 'react-router'
import type { Route } from './+types/list-routes'

export const clientLoader = async () => {
  const { promise, resolve } = Promise.withResolvers<ExecutionRoute[]>()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTES,
    },
    (response) => resolve(response.routes),
  )

  return { routes: await promise }
}

export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const data = await request.formData()
  const { promise, resolve } = Promise.withResolvers<string>()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTE,
      routeId: getString(data, 'routeId'),
    },
    (response) => resolve(`/edit/${encode(response.route)}`),
  )

  return redirect(await promise)
}

const ListRoutes = ({ loaderData: { routes } }: Route.ComponentProps) => (
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
          <Routes>
            {routes.map((route) => (
              <Route key={route.id} route={route} />
            ))}
          </Routes>
        </OnlyConnected>
      </MinimumVersion>
    </Page.Main>
  </Page>
)

export default ListRoutes

const Routes = ({ children }: PropsWithChildren) => {
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

      <Table.TBody>{children}</Table.TBody>
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
  const submitting = useIsPending((data) => data.get('routeId') === routeId)

  return (
    <div
      className={classNames(
        'flex justify-center transition-opacity group-hover:opacity-100',
        submitting ? 'opacity-100' : 'opacity-0',
      )}
    >
      <Form>
        <GhostButton
          submit
          size="tiny"
          name="routeId"
          value={routeId}
          busy={submitting}
        >
          Edit
        </GhostButton>
      </Form>
    </div>
  )
}
