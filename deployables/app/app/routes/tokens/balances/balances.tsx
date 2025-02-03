import { useTokenBalances } from '@/balances-client'
import {
  Error as ErrorAlert,
  GhostLinkButton,
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
        {data.map(
          ({ logo, name, token_address, balance_formatted, usd_value }) => (
            <Table.Tr key={name}>
              <Table.Td noWrap>
                <Token logo={logo}>{name}</Token>
              </Table.Td>
              <Table.Td align="right">
                <TokenValue
                  action={
                    <GhostLinkButton
                      iconOnly
                      icon={Upload}
                      size="tiny"
                      to={`/tokens/send/${token_address}`}
                    >
                      Send
                    </GhostLinkButton>
                  }
                >
                  {balance_formatted}
                </TokenValue>
              </Table.Td>
              <Table.Td align="right">
                <UsdValue>{usd_value}</UsdValue>
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
