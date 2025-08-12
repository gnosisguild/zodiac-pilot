import { Token } from '@/components'
import type { ApprovalTransaction } from '@/simulation-server'
import {
  Popover,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { Address } from '@zodiac/web3'
import { type PrefixedAddress } from 'ser-kit'
import { formatApprovalAmount } from './formatApprovalAmount'

type TokenApprovalTableProps = {
  approvals: ApprovalTransaction[]
  avatar?: PrefixedAddress
  revokeAll: boolean
}

export function TokenApprovalTable({
  approvals,
  revokeAll,
}: TokenApprovalTableProps) {
  return (
    <Table dense>
      <TableHead>
        <TableRow>
          {approvals.length > 0 && (
            <>
              <TableHeader className="w-1/3">Token</TableHeader>
              <TableHeader>Spender</TableHeader>
              <TableHeader align="right">Remaining Approval</TableHeader>
            </>
          )}
        </TableRow>
      </TableHead>

      <TableBody>
        {approvals.length === 0 && (
          <TableRow>
            <TableCell align="center">
              <span className="italic opacity-75">
                No token approvals recorded
              </span>
            </TableCell>
          </TableRow>
        )}

        {approvals.map(
          ({ symbol, logoUrl, spender, approvalAmount, decimals }, index) => {
            return (
              <TableRow key={index}>
                <TableCell>
                  <Token logoUrl={logoUrl}>{symbol}</Token>
                </TableCell>

                <TableCell>
                  <Address shorten size="small">
                    {spender as PrefixedAddress}
                  </Address>
                </TableCell>

                <TableCell align="right">
                  {revokeAll ? (
                    <div className="flex flex-col items-center justify-end gap-1 tabular-nums sm:flex-row sm:items-center sm:gap-2">
                      {approvalAmount > 0n && (
                        <del className="mr-2">
                          <ApprovalDisplay
                            approvalAmount={approvalAmount}
                            decimals={decimals}
                          />
                        </del>
                      )}

                      <span className="text-green-700 dark:text-green-500">
                        0
                      </span>
                    </div>
                  ) : approvalAmount > 0n ? (
                    <ApprovalDisplay
                      approvalAmount={approvalAmount}
                      decimals={decimals}
                    />
                  ) : (
                    <span className="text-green-700 dark:text-green-500">
                      0
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )
          },
        )}
      </TableBody>
    </Table>
  )
}

const ApprovalDisplay = ({
  approvalAmount,
  decimals,
}: {
  approvalAmount: bigint
  decimals: number
}) => {
  const { display, tooltip } = formatApprovalAmount(approvalAmount, decimals)
  return (
    <Popover
      inline
      popover={
        <span className="tabular-numbs text-sm slashed-zero">{tooltip}</span>
      }
    >
      <span className="tabular-nums text-red-700 dark:text-red-500">
        {display}
      </span>
    </Popover>
  )
}
