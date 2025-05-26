import { useTokenBalances } from '@/balances-client'
import { Token } from '@/components'
import {
  Empty,
  Error as ErrorAlert,
  GhostLinkButton,
  Info,
  SkeletonText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TokenValue,
  UsdValue,
} from '@zodiac/ui'
import { ArrowUpFromLine } from 'lucide-react'
import { href } from 'react-router'
import type { Route } from './+types/balances'

export const meta: Route.MetaFunction = () => [{ title: 'Pilot | Balances' }]

const Balances = () => {
  const [{ data, isForked }, state] = useTokenBalances()
  if (data.length === 0 && state !== 'loading') {
    return (
      <Info title="Nothing to show">
        We could not find any relevant token balances in the connected account.
      </Info>
    )
  }

  return (
    <>
      {isForked && (
        <Info title="Simulated balances">
          The balances you see are based on your current simulation.
        </Info>
      )}

      <Table
        dense
        bleed
        className="[--gutter:--spacing(8)] sm:[--gutter:--spacing(16)]"
      >
        <TableHead>
          <TableRow withActions>
            <TableHeader>Token</TableHeader>
            <TableHeader align="right">Balance</TableHeader>
            <TableHeader align="right">USD</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(
            ({
              contractId,
              chain,
              name,
              logoUrl,
              usdValue,
              amount,
              symbol,
              diff,
            }) => (
              <TableRow key={contractId} className="group">
                <TableCell>
                  <Token contract={contractId} logo={logoUrl}>
                    {name}
                  </Token>
                </TableCell>
                <TableCell align="right">
                  <TokenValue symbol={symbol} delta={diff?.amount}>
                    {amount}
                  </TokenValue>
                </TableCell>
                <TableCell align="right">
                  {usdValue == null ? (
                    <Empty />
                  ) : (
                    <UsdValue delta={diff?.usdValue}>{usdValue}</UsdValue>
                  )}
                </TableCell>
                <TableCell className="pr-16">
                  <div className="flex justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <GhostLinkButton
                      icon={ArrowUpFromLine}
                      size="tiny"
                      to={href('/tokens/send/:chain/:token', {
                        chain,
                        token: contractId,
                      })}
                    >
                      Send
                    </GhostLinkButton>
                  </div>
                </TableCell>
              </TableRow>
            ),
          )}

          {state === 'loading' &&
            data.length === 0 &&
            Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <SkeletonText />
                </TableCell>
                <TableCell align="right">
                  <SkeletonText />
                </TableCell>
                <TableCell align="right">
                  <SkeletonText />
                </TableCell>
                <TableCell />
              </TableRow>
            ))}
        </TableBody>
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
