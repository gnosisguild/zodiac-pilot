import { useTokenBalances } from '@/balances-client'
import { Token } from '@/components'
import {
  Error as ErrorAlert,
  GhostLinkButton,
  Info,
  SkeletonText,
  Table,
  TokenValue,
  UsdValue,
} from '@zodiac/ui'
import { ArrowUpFromLine } from 'lucide-react'
import type { Route } from './+types/balances'

export const meta: Route.MetaFunction = () => [{ title: 'Pilot | Balances' }]

const Balances = () => {
  const [{ data, isForked }, state] = useTokenBalances()

  return (
    <>
      {isForked && (
        <Info title="Simulated balances">
          The balances you see are based on your current simulation.
        </Info>
      )}

      <Table>
        <Table.THead>
          <Table.Tr>
            <Table.Th className="w-1/2">
              <span className="pl-6">Token</span>
            </Table.Th>
            <Table.Th className="w-1/5" align="right">
              Balance
            </Table.Th>
            <Table.Th className="w-1/5" align="right">
              USD
            </Table.Th>
            <Table.Th className="w-1/10" />
          </Table.Tr>
        </Table.THead>
        <Table.TBody>
          {data.map(
            ({
              contractId,
              chain,
              name,
              logoUrl,
              usdValue,
              amount,
              symbol,
            }) => (
              <Table.Tr key={contractId}>
                <Table.Td noWrap>
                  <Token logo={logoUrl}>{name}</Token>
                </Table.Td>
                <Table.Td align="right">
                  <TokenValue symbol={symbol}>{amount}</TokenValue>
                </Table.Td>
                <Table.Td align="right">
                  <UsdValue>{usdValue}</UsdValue>
                </Table.Td>
                <Table.Td align="right">
                  <div className="flex justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <GhostLinkButton
                      icon={ArrowUpFromLine}
                      size="tiny"
                      to={`/tokens/send/${chain}/${contractId}`}
                    >
                      Send
                    </GhostLinkButton>
                  </div>
                </Table.Td>
              </Table.Tr>
            ),
          )}

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
                <Table.Td />
              </Table.Tr>
            ))}
        </Table.TBody>
      </Table>
    </>
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
