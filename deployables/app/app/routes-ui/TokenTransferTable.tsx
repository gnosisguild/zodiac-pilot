import type { TokenTransfer } from '@/balances-client'
import { Token } from '@/components'
import {
  Address,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import type { Address as AddressType } from 'ser-kit'

const enum TokenTransferType {
  SENT = 'Tokens Sent',
  RECEIVED = 'Tokens Received',
  OTHER = 'Other',
}

type AddressItemType = {
  type: string
  from: AddressType
  to: AddressType
}

type TokenTransferTable = {
  title: string
  tokens: TokenTransfer[]
}

const headerMap: Record<string, string> = {
  [TokenTransferType.SENT]: 'Recipient',
  [TokenTransferType.RECEIVED]: 'Sender',
}

export const TokenTransferTable = ({ title, tokens }: TokenTransferTable) => {
  return (
    <Table dense bleed>
      <TableHead>
        <TableRow>
          <TableHeader>Token</TableHeader>

          <TableHeader align="right">
            {headerMap[title] ?? 'From → To'}
          </TableHeader>
        </TableRow>
      </TableHead>

      <TableBody>
        {tokens.map(({ symbol, from, to, logoUrl, amount }, idx) => (
          <TableRow key={`${symbol}-${from}-${to}-${idx}`}>
            <TableCell>
              <Token logo={logoUrl}>
                {symbol} <span className="ml-2"> {amount}</span>
              </Token>
            </TableCell>

            {/* Addresses column */}
            <TableCell align="right">
              {AddressItem({ type: title, from, to })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const AddressItem = ({ type, from, to }: AddressItemType) => {
  const transferType: Record<string, React.ReactNode> = {
    [TokenTransferType.SENT]: (
      <div className="flex justify-end gap-1">
        <Address shorten size="small">
          {to}
        </Address>
      </div>
    ),
    [TokenTransferType.RECEIVED]: (
      <div className="flex justify-end gap-1">
        <Address shorten size="small">
          {from}
        </Address>
      </div>
    ),
  }

  return (
    transferType[type] ?? (
      <div className="flex flex-col items-center justify-end gap-1 text-right sm:flex-row sm:items-center sm:gap-2">
        <span className="whitespace-nowrap">
          <Address shorten size="small">
            {from}
          </Address>
        </span>
        <span className="hidden sm:block">→</span>
        <span className="whitespace-nowrap">
          <Address shorten size="small">
            {to}
          </Address>
        </span>
      </div>
    )
  )
}
