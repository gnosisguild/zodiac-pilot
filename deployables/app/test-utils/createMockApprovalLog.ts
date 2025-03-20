import type { ApprovalLog } from '@/simulation-server'
import type { HexAddress } from '@zodiac/schema'
import { randomAddress } from '@zodiac/test-utils'

type ApprovalLogOptions = {
  rawAddress?: HexAddress
  owner?: HexAddress
  spender?: HexAddress
  value?: number
}

export const createMockApprovalLog = ({
  rawAddress = randomAddress(),
  owner = randomAddress(),
  spender = randomAddress(),
  value = 0,
}: ApprovalLogOptions = {}): ApprovalLog => ({
  name: 'Approval',
  raw: {
    address: rawAddress,
  },
  inputs: [
    { soltype: { name: 'owner' }, value: owner },
    { soltype: { name: 'spender' }, value: spender },
    { soltype: { name: 'value' }, value: value.toString() },
  ],
})
