import { Page } from '@/components'
import { Table } from '@zodiac/ui'
import { CircleDollarSign } from 'lucide-react'
import { useEffect, type PropsWithChildren } from 'react'
import { useFetcher } from 'react-router'
import { useAccount } from 'wagmi'
import type { BalanceResult } from '../types.server'
import type { Route } from './+types/balances'

export const meta: Route.MetaFunction = () => [{ title: 'Pilot | Balances' }]

const Balances = () => {
  const { address, chainId } = useAccount()
  const { load, data = [] } = useFetcher<BalanceResult>()

  useEffect(() => {
    if (address == null || chainId == null) {
      return
    }

    load(`/${address}/${chainId}/balances`)
  }, [address, chainId, load])

  return (
    <Page>
      <Page.Header>Balances</Page.Header>

      <Page.Main>
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
            {data.map((result) => (
              <Table.Tr key={result.name}>
                <Table.Td noWrap>
                  <div className="flex items-center gap-2">
                    {result.logo ? (
                      <img
                        src={result.logo}
                        alt={result.name}
                        className="size-4 rounded-full"
                      />
                    ) : (
                      <div className="flex size-4 items-center justify-center">
                        <CircleDollarSign size={16} className="opacity-50" />
                      </div>
                    )}
                    {result.name}
                  </div>
                </Table.Td>
                <Table.Td align="right">
                  <Token>{result.balanceFormatted}</Token>
                </Table.Td>
                <Table.Td align="right">
                  <USD>{result.usdValue}</USD>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.TBody>
        </Table>
      </Page.Main>
    </Page>
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
