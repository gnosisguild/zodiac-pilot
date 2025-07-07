import { ConfirmableAction } from '@/components'
import { Chain } from '@/routes-ui'
import { useWorkspaceId } from '@/workspaces'
import { CHAIN_NAME } from '@zodiac/chains'
import type { Account } from '@zodiac/db/schema'
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
  active: boolean
}

export const RemoteAccount = ({ account, active }: RemoteAccountProps) => {
  return (
    <TableRow
      className="group"
      href={href('/workspace/:workspaceId/accounts/:accountId', {
        accountId: account.id,
        workspaceId: useWorkspaceId(),
      })}
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
          to={href('/workspace/:workspaceId/accounts/:accountId', {
            accountId,
            workspaceId: useWorkspaceId(),
          })}
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
          intent={Intent.DeleteAccount}
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
