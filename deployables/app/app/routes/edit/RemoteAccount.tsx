import { ConfirmableAction } from '@/components'
import { Chain } from '@/routes-ui'
import { CHAIN_NAME, ZERO_ADDRESS } from '@zodiac/chains'
import type { Account, Wallet } from '@zodiac/db/schema'
import { useIsPending } from '@zodiac/hooks'
import {
  Address,
  GhostLinkButton,
  MeatballMenu,
  TableCell,
  TableRow,
  Tag,
} from '@zodiac/ui'
import classNames from 'classnames'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
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

        <ConfirmableAction
          title="Confirm delete"
          description="Are you sure you want to delete this account? This action cannot be undone."
          busy={submitting}
          intent={Intent.RemoteDelete}
          onConfirmChange={setConfirmingDelete}
          style="critical"
          context={{ accountId }}
        >
          Delete
        </ConfirmableAction>
      </MeatballMenu>
    </div>
  )
}
