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
import { ZeroAddress } from 'ethers'
import type { LucideIcon } from 'lucide-react'
import { unprefixAddress, type PrefixedAddress } from 'ser-kit'

type TokenTransferTable = {
  icon: LucideIcon
  title: string
  columnTitle: string
  tokens: TokenTransfer[]
  avatar: PrefixedAddress
}

export const TokenTransferTable = ({
  icon: Icon,
  title,
  columnTitle,
  tokens,
  avatar,
}: TokenTransferTable) => {
  const avatarAddress = unprefixAddress(avatar).toLowerCase()

  return (
    <Table dense>
      <TableHead>
        <TableRow>
          <TableHeader>
            <div className="flex items-center gap-1">
              <Icon size={16} />
              {title}
            </div>
          </TableHeader>

          <TableHeader align="right">{columnTitle}</TableHeader>
        </TableRow>
      </TableHead>

      <TableBody>
        {tokens.length === 0 && (
          <TableRow>
            <TableCell colSpan={2} align="center">
              <span className="italic opacity-75">No recorded token flows</span>
            </TableCell>
          </TableRow>
        )}

        {tokens.map(({ symbol, from, to, logoUrl, amount }, index) => {
          const fromAvatar = from.toLowerCase() === avatarAddress
          const toAvatar = to.toLowerCase() === avatarAddress
          const isMint = from === ZeroAddress
          const isBurn = to === ZeroAddress

          return (
            <TableRow key={index}>
              <TableCell>
                <Token logo={logoUrl}>
                  {symbol} <span className="ml-2">{amount}</span>
                </Token>
              </TableCell>

              <TableCell align="right">
                <div className="flex flex-col items-center justify-end gap-1 text-right sm:flex-row sm:items-center sm:gap-2">
                  {!fromAvatar && (
                    <span className="whitespace-nowrap">
                      {isMint ? (
                        <span title={`${ZeroAddress} (mint)`}>🌱</span>
                      ) : (
                        <Address shorten size="small">
                          {from}
                        </Address>
                      )}
                    </span>
                  )}

                  {!fromAvatar && !toAvatar && (
                    <span className="hidden sm:block">→</span>
                  )}

                  {!toAvatar && (
                    <span className="whitespace-nowrap">
                      {isBurn ? (
                        <span title={`${ZeroAddress} (burn)`}>🔥</span>
                      ) : (
                        <Address shorten size="small">
                          {to}
                        </Address>
                      )}
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
