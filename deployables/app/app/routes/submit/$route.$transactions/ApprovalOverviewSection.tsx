// ApprovalOverviewSection.tsx
import type { ApprovalTransaction } from '@/simulation-server'
import { Checkbox, SkeletonText, Success } from '@zodiac/ui'
import { Suspense, useState } from 'react'
import { Await } from 'react-router'
import { TokenApprovalTable } from './TokenApprovalTable'

type ApprovalOverviewSectionProps = {
  simulation: Promise<{
    hasApprovals: boolean
    approvalTransactions: ApprovalTransaction[]
  }>
}

export function ApprovalOverviewSection({
  simulation,
}: ApprovalOverviewSectionProps) {
  const [revokeAll, setRevokeAll] = useState(true)

  return (
    <Suspense fallback={<SkeletonText />}>
      <Await resolve={simulation}>
        {({ hasApprovals, approvalTransactions }) =>
          hasApprovals ? (
            <>
              <Checkbox
                label="Revoke all approvals"
                name="revokeApprovals"
                defaultChecked
                checked={revokeAll}
                onChange={(e) => setRevokeAll(e.target.checked)}
              />
              <TokenApprovalTable
                approvals={approvalTransactions}
                revokeAll={revokeAll}
              />
            </>
          ) : (
            <Success title="No approval to revoke" />
          )
        }
      </Await>
    </Suspense>
  )
}
