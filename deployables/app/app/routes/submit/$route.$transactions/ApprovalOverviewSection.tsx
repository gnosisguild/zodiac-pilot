import type { ApprovalTransaction } from '@/simulation-server'
import { Checkbox, Success } from '@zodiac/ui'
import { Suspense, useState } from 'react'
import { Await } from 'react-router'
import { SkeletonFlowTable } from './SkeletonFlowTable'
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
  const [revokeAll, setRevokeAll] = useState(false)

  return (
    <Suspense fallback={<SkeletonFlowTable />}>
      <Await resolve={simulation}>
        {({ hasApprovals, approvalTransactions }) =>
          hasApprovals ? (
            <>
              <TokenApprovalTable
                approvals={approvalTransactions}
                revokeAll={revokeAll}
              />

              <Checkbox
                label="Revoke all approvals"
                name="revokeApprovals"
                checked={revokeAll}
                onChange={(e) => setRevokeAll(e.target.checked)}
              />
            </>
          ) : (
            <Success title="No recorded approvals" />
          )
        }
      </Await>
    </Suspense>
  )
}
