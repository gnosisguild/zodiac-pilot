import { MinimumVersion } from '@/components'
import { useIsPending } from '@/hooks'
import { Chain } from '@/routes-ui'
import { CHAIN_NAME, getChainId, ZERO_ADDRESS } from '@zodiac/chains'
import type { ExecutionRoute } from '@zodiac/schema'
import {
  Address,
  Form,
  GhostButton,
  GhostLinkButton,
  MeatballMenu,
  Modal,
  PrimaryButton,
  TableCell,
  TableRow,
  Tag,
} from '@zodiac/ui'
import classNames from 'classnames'
import { Pencil, Play, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { href } from 'react-router'
import { Intent } from './intents'

type LocalAccountProps = { route: ExecutionRoute; active: boolean }

export const LocalAccount = ({ route, active }: LocalAccountProps) => {
  const chainId = getChainId(route.avatar)

  return (
    <TableRow
      className="group"
      href={href('/edit/:routeId', { routeId: route.id })}
    >
      <TableCell aria-describedby={route.id}>{route.label}</TableCell>
      <TableCell>
        {active && (
          <Tag id={route.id} color="green">
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
  const submitting = useIsPending(
    undefined,
    (data) => data.get('routeId') === routeId,
  )
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
