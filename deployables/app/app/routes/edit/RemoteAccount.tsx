import type { Account } from '@/db'
import { useIsPending } from '@/hooks'
import { Chain } from '@/routes-ui'
import { CHAIN_NAME, ZERO_ADDRESS } from '@zodiac/chains'
import {
  Address,
  Form,
  GhostButton,
  MeatballMenu,
  Modal,
  PrimaryButton,
  TableCell,
  TableRow,
  Tag,
} from '@zodiac/ui'
import classNames from 'classnames'
import { Play, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Intent } from './intents'

type RemoteAccountProps = {
  account: Account
  active: boolean
}

export const RemoteAccount = ({ account, active }: RemoteAccountProps) => {
  return (
    <TableRow
      className="group"
      // href={href('/edit/account/:accountId', { accountId: account.id })}
    >
      <TableCell aria-describedby={account.id}>{account.label}</TableCell>
      <TableCell>
        {active && (
          <Tag id={account.id} color="green">
            Active
          </Tag>
        )}
      </TableCell>
      <TableCell>
        <Chain chainId={account.chainId}>{CHAIN_NAME[account.chainId]}</Chain>
      </TableCell>
      <TableCell>
        <Address>{ZERO_ADDRESS}</Address>
        {/* {account.initiator == null ? (
        ) : (
          <Address shorten>{route.initiator}</Address>
        )} */}
      </TableCell>
      <TableCell>
        <Address shorten>{account.address}</Address>
      </TableCell>
      <TableCell>
        <Actions accountId={account.id} />
      </TableCell>
    </TableRow>
  )
}

const Actions = ({ accountId }: { accountId: string }) => {
  const submitting = useIsPending(
    undefined,
    (data) => data.get('accountId') === accountId,
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
      <Launch accountId={accountId} />

      <MeatballMenu
        open={menuOpen || confirmingDelete}
        size="tiny"
        label="Account options"
        onRequestShow={() => setMenuOpen(true)}
        onRequestHide={() => setMenuOpen(false)}
      >
        <Delete accountId={accountId} onConfirmChange={setConfirmingDelete} />
      </MeatballMenu>
    </div>
  )
}

const Launch = ({ accountId }: { accountId: string }) => {
  const submitting = useIsPending(
    Intent.RemoteLaunch,
    (data) => data.get('accountId') === accountId,
  )

  return (
    <Form intent={Intent.RemoteLaunch}>
      <GhostButton
        submit
        align="left"
        size="tiny"
        name="accountId"
        value={accountId}
        busy={submitting}
        icon={Play}
      >
        Launch
      </GhostButton>
    </Form>
  )
}

const Delete = ({
  accountId,
  onConfirmChange,
}: {
  accountId: string
  onConfirmChange: (state: boolean) => void
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const submitting = useIsPending(
    Intent.RemoteDelete,
    (data) => data.get('accountId') === accountId,
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
        <Form
          intent={Intent.RemoteDelete}
          onSubmit={() => setConfirmDelete(false)}
        >
          <Modal.Actions>
            <PrimaryButton
              submit
              name="accountId"
              value={accountId}
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
