import { Chain } from '@/routes-ui'
import { useWorkspaceId } from '@/workspaces'
import { CHAIN_NAME } from '@zodiac/chains'
import type { Account } from '@zodiac/db/schema'
import {
  Address,
  GhostLinkButton,
  MeatballMenu,
  TableCell,
  TableRow,
  TableRowActions,
  Tag,
} from '@zodiac/ui'
import { Pencil, Trash2 } from 'lucide-react'
import { href } from 'react-router'

type RemoteAccountProps = {
  account: Account
  active: boolean
}

export const RemoteAccount = ({ account, active }: RemoteAccountProps) => {
  return (
    <TableRow
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
        <TableRowActions>
          <MeatballMenu size="tiny" label="Account options">
            <GhostLinkButton
              to={href('/workspace/:workspaceId/accounts/:accountId', {
                accountId: account.id,
                workspaceId: useWorkspaceId(),
              })}
              icon={Pencil}
              align="left"
              size="tiny"
            >
              Edit
            </GhostLinkButton>

            <GhostLinkButton
              to={href('/workspace/:workspaceId/accounts/delete/:accountId', {
                workspaceId: useWorkspaceId(),
                accountId: account.id,
              })}
              size="tiny"
              style="critical"
              align="left"
              icon={Trash2}
            >
              Delete
            </GhostLinkButton>
          </MeatballMenu>
        </TableRowActions>
      </TableCell>
    </TableRow>
  )
}
