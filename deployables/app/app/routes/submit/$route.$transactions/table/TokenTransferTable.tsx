import type { TokenTransfer } from '@/balances-client'
import { Token } from '@/components'
import {
  Address,
  NumberValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { formatUnits, parseUnits, ZeroAddress } from 'ethers'
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

  const aggregated = aggregateTokenTransfers(tokens)

  return (
    <Table dense>
      <TableHead>
        <TableRow>
          <TableHeader className="w-1/3">
            <div className="flex items-center gap-1">
              <Icon size={16} />
              {title}
            </div>
          </TableHeader>

          {tokens.length > 0 && (
            <>
              <TableHeader>{columnTitle}</TableHeader>
              <TableHeader align="right">Amount</TableHeader>
            </>
          )}
        </TableRow>
      </TableHead>

      <TableBody>
        {tokens.length === 0 && (
          <TableRow>
            <TableCell align="center">
              <span className="italic opacity-75">No recorded token flows</span>
            </TableCell>
          </TableRow>
        )}

        {aggregated.map(
          ({ symbol, from, to, logoUrl, amount, contractId }, index) => {
            const fromAvatar = from.toLowerCase() === avatarAddress
            const toAvatar = to.toLowerCase() === avatarAddress
            const isMint = from === ZeroAddress
            const isBurn = to === ZeroAddress

            return (
              <TableRow key={index}>
                <TableCell>
                  <Token contract={contractId} logo={logoUrl}>
                    {symbol}
                  </Token>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-2">
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

                <TableCell align="right" className="tabular-nums">
                  <NumberValue precision={4}>{amount}</NumberValue>
                </TableCell>
              </TableRow>
            )
          },
        )}
      </TableBody>
    </Table>
  )
}

const aggregateTokenTransfers = (tokens: TokenTransfer[]): TokenTransfer[] => {
  const aggregated = tokens.reduce(
    (acc: { [key: string]: TokenTransfer }, token) => {
      const aggKey = `${token.contractId}-${token.from}-${token.to}`
      if (!acc[aggKey]) {
        acc[aggKey] = { ...token }
      } else {
        acc[aggKey].amount = formatUnits(
          parseUnits(acc[aggKey].amount, token.decimals) +
            parseUnits(token.amount, token.decimals),
          token.decimals,
        ) as `${number}`
      }
      return acc
    },
    {},
  )

  return Object.values(aggregated)
}
