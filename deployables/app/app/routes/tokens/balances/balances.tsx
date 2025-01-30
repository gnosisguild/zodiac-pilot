import { useTokenBalances } from '@/balances'
import { Error as ErrorAlert, SkeletonText, Table } from '@zodiac/ui'
import { CircleDollarSign } from 'lucide-react'
import { type PropsWithChildren } from 'react'
import type { Route } from './+types/balances'

export const meta: Route.MetaFunction = () => [{ title: 'Pilot | Balances' }]

const Balances = () => {
  const [data, state] = useTokenBalances()

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
        {data.map(({ logo, name, balanceFormatted, usdValue }) => (
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

        {state === 'loading' &&
          data.length === 0 &&
          Array.from({ length: 10 }).map((_, index) => (
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

export default Balances

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  if (error instanceof Error) {
    return (
      <ErrorAlert title="Could not load balances">{error.message}</ErrorAlert>
    )
  }
}

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
