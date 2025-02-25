import { getAvailableChains } from '@/balances-server'
import { fromVersion, MinimumVersion, OnlyConnected, Page } from '@/components'
import { useIsPending } from '@/hooks'
import { Chain, ProvideChains } from '@/routes-ui'
import { CHAIN_NAME, getChainId, ZERO_ADDRESS } from '@zodiac/chains'
import { getString } from '@zodiac/form-data'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { encode, type ExecutionRoute } from '@zodiac/schema'
import {
  Address,
  Form,
  GhostButton,
  Info,
  Modal,
  PrimaryButton,
  Table,
  Tag,
} from '@zodiac/ui'
import classNames from 'classnames'
import { Pencil, Play, Trash2 } from 'lucide-react'
import { useState, type PropsWithChildren } from 'react'
import { href, redirect } from 'react-router'
import type { Route } from './+types/list-routes'
import { Intent } from './intents'
import { loadActiveRouteId } from './loadActiveRouteId'
import { loadRoutes } from './loadRoutes'

export const loader = async () => ({ chains: await getAvailableChains() })

export const clientLoader = async ({
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const [serverData, routes, activeRouteId] = await Promise.all([
    serverLoader(),
    loadRoutes(),
    fromVersion('3.6.0', () => loadActiveRouteId()),
  ])

  return { ...serverData, routes, activeRouteId }
}

clientLoader.hydrate = true as const

export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const data = await request.formData()
  const intent = getString(data, 'intent')

  switch (intent) {
    case Intent.Edit: {
      const { promise, resolve } = Promise.withResolvers<string>()

      companionRequest(
        {
          type: CompanionAppMessageType.REQUEST_ROUTE,
          routeId: getString(data, 'routeId'),
        },
        (response) =>
          resolve(href('/edit/:data', { data: encode(response.route) })),
      )

      return redirect(await promise)
    }

    case Intent.Delete: {
      const { promise, resolve } = Promise.withResolvers<void>()

      companionRequest(
        {
          type: CompanionAppMessageType.DELETE_ROUTE,
          routeId: getString(data, 'routeId'),
        },
        () => resolve(),
      )

      await promise

      return null
    }

    case Intent.Launch: {
      const { promise, resolve } = Promise.withResolvers<void>()

      companionRequest(
        {
          type: CompanionAppMessageType.LAUNCH_ROUTE,
          routeId: getString(data, 'routeId'),
        },
        () => resolve(),
      )

      await promise

      return null
    }
  }
}

const ListRoutes = ({
  loaderData: { chains, ...loaderData },
}: Route.ComponentProps) => (
  <ProvideChains chains={chains}>
    <Page fullWidth>
      <Page.Header>Accounts</Page.Header>

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
            {'routes' in loaderData && 'activeRouteId' in loaderData && (
              <Routes>
                {loaderData.routes.map((route) => (
                  <Route
                    key={route.id}
                    route={route}
                    active={route.id === loaderData.activeRouteId}
                  />
                ))}
              </Routes>
            )}
          </OnlyConnected>
        </MinimumVersion>
      </Page.Main>
    </Page>
  </ProvideChains>
)

export default ListRoutes

const Routes = ({ children }: PropsWithChildren) => {
  return (
    <Table>
      <Table.THead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Chain</Table.Th>
          <Table.Th>Initiator</Table.Th>
          <Table.Th>Account</Table.Th>
          <Table.Th className="w-1/10" />
        </Table.Tr>
      </Table.THead>

      <Table.TBody>{children}</Table.TBody>
    </Table>
  )
}

type RouteProps = { route: ExecutionRoute; active: boolean }

const Route = ({ route, active }: RouteProps) => {
  const chainId = getChainId(route.avatar)

  return (
    <Table.Tr>
      <Table.Td aria-describedby={route.id}>
        <div className="flex items-center justify-between gap-4">
          {route.label}
          {active && (
            <Tag aria-hidden id={route.id} color="success">
              Active
            </Tag>
          )}
        </div>
      </Table.Td>
      <Table.Td>
        <Chain chainId={chainId}>{CHAIN_NAME[chainId]}</Chain>
      </Table.Td>
      <Table.Td>
        {route.initiator == null ? (
          <Address>{ZERO_ADDRESS}</Address>
        ) : (
          <Address shorten>{route.initiator}</Address>
        )}
      </Table.Td>
      <Table.Td>
        <Address shorten>{route.avatar}</Address>
      </Table.Td>
      <Table.Td align="right">
        <Actions routeId={route.id}>
          <MinimumVersion version="3.6.0">
            <Launch routeId={route.id} />
          </MinimumVersion>
          <Edit routeId={route.id} />
          <MinimumVersion version="3.6.0">
            <Delete routeId={route.id} />
          </MinimumVersion>
        </Actions>
      </Table.Td>
    </Table.Tr>
  )
}

const Actions = ({
  children,
  routeId,
}: PropsWithChildren<{ routeId: string }>) => {
  const submitting = useIsPending((data) => data.get('routeId') === routeId)

  return (
    <div
      className={classNames(
        'flex justify-center transition-opacity group-hover:opacity-100',
        submitting ? 'opacity-100' : 'opacity-0',
      )}
    >
      {children}
    </div>
  )
}

const Launch = ({ routeId }: { routeId: string }) => {
  const submitting = useIsPending(
    Intent.Launch,
    (data) => data.get('routeId') === routeId,
  )

  return (
    <Form intent={Intent.Launch}>
      <GhostButton
        submit
        size="tiny"
        name="routeId"
        value={routeId}
        busy={submitting}
        icon={Play}
      >
        Launch
      </GhostButton>
    </Form>
  )
}

const Edit = ({ routeId }: { routeId: string }) => {
  const submitting = useIsPending(
    Intent.Edit,
    (data) => data.get('routeId') === routeId,
  )

  return (
    <Form intent={Intent.Edit}>
      <GhostButton
        submit
        size="tiny"
        name="routeId"
        icon={Pencil}
        value={routeId}
        busy={submitting}
      >
        Edit
      </GhostButton>
    </Form>
  )
}

const Delete = ({ routeId }: { routeId: string }) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const submitting = useIsPending(
    Intent.Delete,
    (data) => data.get('routeId') === routeId,
  )

  return (
    <>
      <GhostButton
        size="tiny"
        icon={Trash2}
        style="critical"
        onClick={() => setConfirmDelete(true)}
        busy={submitting}
      >
        Delete
      </GhostButton>

      <Modal
        title="Confirm delete"
        closeLabel="Cancel"
        onClose={() => setConfirmDelete(false)}
        open={confirmDelete}
      >
        <Modal.Actions>
          <Form intent={Intent.Delete} onSubmit={() => setConfirmDelete(false)}>
            <PrimaryButton
              submit
              name="routeId"
              value={routeId}
              style="contrast"
              busy={submitting}
            >
              Delete
            </PrimaryButton>
          </Form>
        </Modal.Actions>
      </Modal>
    </>
  )
}
