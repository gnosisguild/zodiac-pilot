import { fromVersion, MinimumVersion, OnlyConnected, Page } from '@/components'
import { useIsPending } from '@/hooks'
import { Chain } from '@/routes-ui'
import { CHAIN_NAME, getChainId, ZERO_ADDRESS } from '@zodiac/chains'
import { getString } from '@zodiac/form-data'
import {
  CompanionAppMessageType,
  companionRequest,
  CompanionResponseMessageType,
  useExtensionMessageHandler,
} from '@zodiac/messages'
import { type ExecutionRoute } from '@zodiac/schema'
import {
  Address,
  Form,
  GhostButton,
  GhostLinkButton,
  Info,
  MeatballMenu,
  Modal,
  PrimaryButton,
  SecondaryLinkButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from '@zodiac/ui'
import classNames from 'classnames'
import { Pencil, Play, Trash2 } from 'lucide-react'
import { useEffect, useState, type PropsWithChildren } from 'react'
import { href, useRevalidator } from 'react-router'
import type { Route } from './+types/list-routes'
import { Intent } from './intents'
import { loadActiveRouteId } from './loadActiveRouteId'
import { loadRoutes } from './loadRoutes'

export const clientLoader = async () => {
  const [routes, activeRouteId] = await Promise.all([
    loadRoutes(),
    fromVersion('3.6.0', () => loadActiveRouteId()),
  ])

  return { routes, activeRouteId }
}

clientLoader.hydrate = true as const

export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const data = await request.formData()
  const intent = getString(data, 'intent')

  switch (intent) {
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

const ListRoutes = ({ loaderData }: Route.ComponentProps) => {
  const { revalidate, state } = useRevalidator()

  useExtensionMessageHandler(
    CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
    ({ activeRouteId }) => {
      if (state === 'idle' && activeRouteId !== loaderData.activeRouteId) {
        revalidate()
      }
    },
  )

  return (
    <Page fullWidth>
      <Page.Header>Accounts</Page.Header>

      <Page.Main>
        <OnlyConnected>
          {'routes' in loaderData &&
            (loaderData.routes.length > 0 ? (
              <Routes>
                {loaderData.routes.map((route) => (
                  <Route
                    key={route.id}
                    route={route}
                    active={route.id === loaderData.activeRouteId}
                  />
                ))}
              </Routes>
            ) : (
              <Info title="You haven't created any accounts, yet.">
                Accounts let you quickly impersonate other safes and record
                transaction bundles for them.
                <div className="mt-4 flex">
                  <SecondaryLinkButton to="/create">
                    Create an account
                  </SecondaryLinkButton>
                </div>
              </Info>
            ))}
        </OnlyConnected>
      </Page.Main>
    </Page>
  )
}

export default ListRoutes

const Routes = ({ children }: PropsWithChildren) => {
  return (
    <Table
      bleed
      className="[--gutter:--spacing(8)] sm:[--gutter:--spacing(16)]"
    >
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader className="relative w-0">
            <span className="sr-only">Active</span>
          </TableHeader>
          <TableHeader>Chain</TableHeader>
          <TableHeader>Initiator</TableHeader>
          <TableHeader>Account</TableHeader>
          <TableHeader className="relative w-0">
            <span className="sr-only">Actions</span>
          </TableHeader>
        </TableRow>
      </TableHead>

      <TableBody>{children}</TableBody>
    </Table>
  )
}

type RouteProps = { route: ExecutionRoute; active: boolean }

const Route = ({ route, active }: RouteProps) => {
  const chainId = getChainId(route.avatar)

  return (
    <TableRow
      className="group"
      href={href('/edit/:routeId', { routeId: route.id })}
    >
      <TableCell aria-describedby={route.id}>{route.label}</TableCell>
      <TableCell>
        {active && (
          <Tag aria-hidden id={route.id} color="success">
            Active
          </Tag>
        )}
      </TableCell>
      <TableCell>
        <Chain chainId={chainId}>{CHAIN_NAME[chainId]}</Chain>
      </TableCell>
      <TableCell>
        {route.initiator == null ? (
          <Address>{ZERO_ADDRESS}</Address>
        ) : (
          <Address shorten>{route.initiator}</Address>
        )}
      </TableCell>
      <TableCell>
        <Address shorten>{route.avatar}</Address>
      </TableCell>
      <TableCell>
        <Actions routeId={route.id} />
      </TableCell>
    </TableRow>
  )
}

const Actions = ({ routeId }: { routeId: string }) => {
  const submitting = useIsPending((data) => data.get('routeId') === routeId)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <div
      className={classNames(
        'flex justify-end gap-1 transition-opacity group-hover:opacity-100',
        submitting || menuOpen ? 'opacity-100' : 'opacity-0',
      )}
    >
      <MinimumVersion version="3.6.0">
        <Launch routeId={routeId} />
      </MinimumVersion>
      <MeatballMenu
        open={menuOpen || confirmingDelete}
        size="tiny"
        label="Account options"
        onRequestShow={() => setMenuOpen(true)}
        onRequestHide={() => setMenuOpen(false)}
      >
        <Edit routeId={routeId} />

        <MinimumVersion version="3.6.0">
          <Delete routeId={routeId} onConfirmChange={setConfirmingDelete} />
        </MinimumVersion>
      </MeatballMenu>
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
        align="left"
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

const Edit = ({ routeId }: { routeId: string }) => (
  <GhostLinkButton
    to={href('/edit/:routeId', { routeId })}
    align="left"
    size="tiny"
    icon={Pencil}
  >
    Edit
  </GhostLinkButton>
)

const Delete = ({
  routeId,
  onConfirmChange,
}: {
  routeId: string
  onConfirmChange: (state: boolean) => void
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const submitting = useIsPending(
    Intent.Delete,
    (data) => data.get('routeId') === routeId,
  )

  useEffect(() => {
    onConfirmChange(confirmDelete)
  }, [confirmDelete, onConfirmChange])

  return (
    <>
      <GhostButton
        align="left"
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
        description="Are you sure you want to delete this account? This action cannot be undone."
      >
        <Form intent={Intent.Delete} onSubmit={() => setConfirmDelete(false)}>
          <Modal.Actions>
            <PrimaryButton
              submit
              name="routeId"
              value={routeId}
              busy={submitting}
            >
              Delete
            </PrimaryButton>

            <GhostButton onClick={() => setConfirmDelete(false)}>
              Cancel
            </GhostButton>
          </Modal.Actions>
        </Form>
      </Modal>
    </>
  )
}
