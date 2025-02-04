import { useForkUrl, useTokenBalances } from '@/balances-client'
import {
  Error as ErrorAlert,
  GhostLinkButton,
  Info,
  SkeletonText,
  Table,
  TokenValue,
  UsdValue,
} from '@zodiac/ui'
import { Upload } from 'lucide-react'
import { Token } from '../Token'
import type { Route } from './+types/balances'

export const meta: Route.MetaFunction = () => [{ title: 'Pilot | Balances' }]

const Balances = () => {
  const forkUrl = useForkUrl()
  const [{ data }, state] = useTokenBalances()

  return (
    <>
      {forkUrl != null && (
        <Info title="Simulated balances">
          The balances you see are based on your current simulation.
        </Info>
      )}

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
          {data.map(
            ({ contractId, name, logoUrl, usdValue, amount, symbol }) => (
              <Table.Tr key={contractId}>
                <Table.Td noWrap>
                  <Token logo={logoUrl}>{name}</Token>
                </Table.Td>
                <Table.Td align="right">
                  <TokenValue
                    symbol={symbol}
                    action={
                      <GhostLinkButton
                        iconOnly
                        icon={Upload}
                        size="tiny"
                        to={`/tokens/send/${contractId}`}
                      >
                        Send
                      </GhostLinkButton>
                    }
                  >
                    {amount}
                  </TokenValue>
                </Table.Td>
                <Table.Td align="right">
                  <UsdValue>{usdValue}</UsdValue>
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
