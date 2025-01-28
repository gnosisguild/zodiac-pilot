import { Page } from '@/components'
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
        <table className="w-full table-fixed border-separate border-spacing-0 overflow-hidden rounded-md border border-zinc-700">
          <thead>
            <tr>
              <th className="w-2/3 border-b-2 border-zinc-700 py-2 pl-8 text-left">
                Token
              </th>
              <th className="border-b-2 border-zinc-700 px-2 text-right">
                Balance
              </th>
              <th className="border-b-2 border-zinc-700 px-2 text-right">
                USD
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((result) => (
              <tr key={result.name} className="group">
                <td className="whitespace-nowrap border-b border-zinc-700 px-2 text-sm text-white/75 transition-all group-last:border-b-0 group-hover:bg-zinc-900 group-hover:text-white">
                  <div className="flex items-center gap-2 py-1">
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
                </td>
                <td className="border-b border-zinc-700 px-2 text-right text-sm text-white/75 transition-all group-last:border-b-0 group-hover:bg-zinc-900 group-hover:text-white">
                  <Token>{result.balanceFormatted}</Token>
                </td>
                <td className="border-b border-zinc-700 px-2 text-right text-sm text-white/75 transition-all group-last:border-b-0 group-hover:bg-zinc-900 group-hover:text-white">
                  <USD>{result.usdValue}</USD>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
