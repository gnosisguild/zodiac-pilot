import type { ApprovalLog } from '@/simulation-server'
import type { HexAddress } from '@zodiac/schema'
import { randomAddress } from '@zodiac/test-utils'

type ApprovalLogOptions = {
  rawAddress?: HexAddress
  owner?: HexAddress
  spender?: HexAddress
}

export const createMockApprovalLog = ({
  rawAddress = randomAddress(),
  owner = randomAddress(),
  spender = randomAddress(),
}: ApprovalLogOptions = {}): ApprovalLog => ({
  name: 'Approval',
  raw: {
    address: rawAddress,
  },
  inputs: [
    { name: 'owner', value: owner },
    { name: 'spender', value: spender },
  ],
})
