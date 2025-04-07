import type { Account } from '@/db'
import { Chain } from '@/routes-ui'
import { CHAIN_NAME } from '@zodiac/chains'
import { Address, TableCell, TableRow } from '@zodiac/ui'
import { href } from 'react-router'

type RemoteAccountProps = {
  account: Account
}

export const RemoteAccount = ({ account }: RemoteAccountProps) => {
  return (
    <TableRow
      className="group"
      href={href('/edit/account/:accountId', { accountId: account.id })}
    >
      <TableCell aria-describedby={account.id}>{account.label}</TableCell>
      <TableCell>
        {/* {active && (
          <Tag aria-hidden id={account.id} color="green">
            Active
          </Tag>
        )} */}
      </TableCell>
      <TableCell>
        <Chain chainId={account.chainId}>{CHAIN_NAME[account.chainId]}</Chain>
      </TableCell>
      <TableCell>
        {/* {account.initiator == null ? (
          <Address>{ZERO_ADDRESS}</Address>
        ) : (
          <Address shorten>{route.initiator}</Address>
        )} */}
      </TableCell>
      <TableCell>
        <Address shorten>{account.address}</Address>
      </TableCell>
      <TableCell>{/* <Actions routeId={route.id} /> */}</TableCell>
    </TableRow>
  )
}
