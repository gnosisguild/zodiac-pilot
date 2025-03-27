import { Token } from '@/components'
import type { ApprovalTransaction } from '@/simulation-server'
import {
  Address,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { type PrefixedAddress } from 'ser-kit'

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
              <TableHeader>Token</TableHeader>
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

        {approvals.map(({ symbol, logoUrl, spender }, index) => {
          return (
            <TableRow key={index}>
              <TableCell>
                <Token logo={logoUrl}>{symbol}</Token>
              </TableCell>

              <TableCell>
                <Address shorten size="small">
                  {spender as PrefixedAddress}
                </Address>
              </TableCell>

              <TableCell align="right">
                {revokeAll ? (
                  <div className="flex flex-col items-center justify-end gap-1 tabular-nums sm:flex-row sm:items-center sm:gap-2">
                    <del className="mr-2 text-red-400">∞</del>

                    <span className="hidden sm:block">→</span>
                    <span className="text-green-600">0</span>
                  </div>
                ) : (
                  <span className="font-semibold tabular-nums text-red-500">
                    ∞
                  </span>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
