import { useIsSignedIn } from '@/auth-client'
import { Chain } from '@/routes-ui'
import { CHAIN_NAME, getChainId, ZERO_ADDRESS } from '@zodiac/chains'
import { useIsPending } from '@zodiac/hooks'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { encode, type ExecutionRoute } from '@zodiac/schema'
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
import { Pencil, Trash2, UploadIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { href, useSubmit } from 'react-router'
import { Intent } from './intents'

type LocalAccountProps = { route: ExecutionRoute; active: boolean }

export const LocalAccount = ({ route, active }: LocalAccountProps) => {
  const chainId = getChainId(route.avatar)

  return (
    <TableRow
      className="group"
      href={href('/offline/account/:accountId', { accountId: route.id })}
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
      <MeatballMenu
        open={menuOpen || confirmingDelete}
        size="tiny"
        label="Account options"
        onRequestShow={() => setMenuOpen(true)}
        onRequestHide={() => setMenuOpen(false)}
      >
        {useIsSignedIn() && <Upload routeId={routeId} />}

        <Edit routeId={routeId} />

        <Delete routeId={routeId} onConfirmChange={setConfirmingDelete} />
      </MeatballMenu>
    </div>
  )
}

const Upload = ({ routeId }: { routeId: string }) => {
  const submit = useSubmit()

  return (
    <Form
      intent={Intent.Upload}
      context={{ routeId }}
      onSubmit={(event) => {
        const data = new FormData(event.currentTarget)

        const { promise, resolve, reject } =
          Promise.withResolvers<ExecutionRoute>()

        companionRequest(
          { type: CompanionAppMessageType.REQUEST_ROUTE, routeId },
          ({ route }) => {
            if (route == null) {
              reject(`Route with id "${routeId}" not found`)
            } else {
              resolve(route)
            }
          },
        )

        promise.then((route) => {
          data.set('route', encode(route))

          submit(data, { method: 'POST' })
        })

        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <GhostButton
        submit
        size="tiny"
        align="left"
        busy={useIsPending(Intent.Upload)}
        icon={UploadIcon}
      >
        Upload
      </GhostButton>
    </Form>
  )
}

const Edit = ({ routeId }: { routeId: string }) => (
  <GhostLinkButton
    to={href('/offline/account/:accountId', { accountId: routeId })}
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

            <Modal.CloseAction>Cancel</Modal.CloseAction>
          </Modal.Actions>
        </Form>
      </Modal>
    </>
  )
}
