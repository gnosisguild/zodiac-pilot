import { Error, SkeletonText, Table } from '@zodiac/ui'
import { CircleDollarSign } from 'lucide-react'
import { useEffect, type PropsWithChildren } from 'react'
import { useFetcher } from 'react-router'
import { useAccount } from 'wagmi'
import type { BalanceResult } from '../../types.server'
import type { Route } from './+types/balances'

export const meta: Route.MetaFunction = () => [{ title: 'Pilot | Balances' }]

const Balances = () => {
  const { address, chainId } = useAccount()
  const { load, data, state } = useFetcher<BalanceResult>()

  useEffect(() => {
    if (address == null || chainId == null) {
      return
    }

    load(`/${address}/${chainId}/balances`)
  }, [address, chainId, load])

  if (data == null || state === 'loading') {
    return (
      <Table>
        <Table.THead>
          <Table.Tr>
            <Table.Th>
              <span className="pl-6">Token</span>
            </Table.Th>
            <Table.Th align="right">Balance</Table.Th>
            <Table.Th align="right">USD</Table.Th>
          </Table.Tr>
        </Table.THead>
        <Table.TBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <SkeletonText />
              </Table.Td>
              <Table.Td align="right">
                <SkeletonText />
              </Table.Td>
              <Table.Td align="right">
                <SkeletonText />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.TBody>
      </Table>
    )
  }

  if (data.error != null) {
    return <Error title="Could not load balances">{data.error}</Error>
  }

  const { data: balances } = data

  return (
    <Table>
      <Table.THead>
        <Table.Tr>
          <Table.Th>
            <span className="pl-6">Token</span>
          </Table.Th>
          <Table.Th align="right">Balance</Table.Th>
          <Table.Th align="right">USD</Table.Th>
        </Table.Tr>
      </Table.THead>
      <Table.TBody>
        {balances.map(({ logo, name, balanceFormatted, usdValue }) => (
          <Table.Tr key={name}>
            <Table.Td noWrap>
              <div className="flex items-center gap-2">
                {logo ? (
                  <img src={logo} alt={name} className="size-4 rounded-full" />
                ) : (
                  <div className="flex size-4 items-center justify-center">
                    <CircleDollarSign size={16} className="opacity-50" />
                  </div>
                )}
                {name}
              </div>
            </Table.Td>
            <Table.Td align="right">
              <Token>{balanceFormatted}</Token>
            </Table.Td>
            <Table.Td align="right">
              <USD>{usdValue}</USD>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.TBody>
    </Table>
  )
}

export default Balances

const usdFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
})

const USD = ({ children }: { children: number }) => (
  <span className="text-sm slashed-zero tabular-nums">
    {usdFormatter.format(children)}
  </span>
)

type TokenProps = PropsWithChildren

const Token = ({ children }: TokenProps) => (
  <div className="flex items-center justify-end gap-2 text-sm">
    <span className="slashed-zero tabular-nums">{children}</span>
  </div>
)
