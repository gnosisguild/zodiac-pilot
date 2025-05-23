import { Chain } from '@/routes-ui'
import { CHAIN_NAME, ZERO_ADDRESS } from '@zodiac/chains'
import type { Account, Wallet } from '@zodiac/db/schema'
import { useAfterSubmit, useIsPending } from '@zodiac/hooks'
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
import { Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { href } from 'react-router'
import { Intent } from './intents'

type RemoteAccountProps = {
  account: Account
  wallet?: Wallet
  active: boolean
}

export const RemoteAccount = ({
  account,
  wallet,
  active,
}: RemoteAccountProps) => {
  return (
    <TableRow
      className="group"
      href={href('/account/:accountId', { accountId: account.id })}
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
        {wallet == null ? (
          <Address>{ZERO_ADDRESS}</Address>
        ) : (
          <Address shorten label={wallet.label}>
            {wallet.address}
          </Address>
        )}
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
      <MeatballMenu
        open={menuOpen || confirmingDelete}
        size="tiny"
        label="Account options"
        onRequestShow={() => setMenuOpen(true)}
        onRequestHide={() => setMenuOpen(false)}
      >
        <GhostLinkButton
          to={href('/account/:accountId', { accountId })}
          icon={Pencil}
          align="left"
          size="tiny"
        >
          Edit
        </GhostLinkButton>
        <Delete accountId={accountId} onConfirmChange={setConfirmingDelete} />
      </MeatballMenu>
    </div>
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

  useAfterSubmit(Intent.RemoteDelete, () => setConfirmDelete(false))

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
        <Form context={{ accountId }}>
          <Modal.Actions>
            <PrimaryButton
              submit
              intent={Intent.RemoteDelete}
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
