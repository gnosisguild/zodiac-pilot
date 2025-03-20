import {
  createMockApprovalLog,
  createMockSimulatedTransaction,
} from '@/test-utils'
import { randomAddress } from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'
import { extractApprovalsFromSimulation } from './extractApprovalsFromSimulation'

describe('extractApprovalsFromSimulation', () => {
  it('returns an empty array if logs are missing', () => {
    expect(
      extractApprovalsFromSimulation([createMockSimulatedTransaction()]),
    ).toEqual([])
  })

  it('ignores logs that do not have name="Approval"', () => {
    const transaction = createMockSimulatedTransaction({
      transaction_info: {
        logs: [
          {
            name: 'Transfer',
          },
        ],
      },
    })

    expect(extractApprovalsFromSimulation([transaction])).toEqual([])
  })

  it('extracts approval logs correctly', () => {
    const tokenA = randomAddress()
    const spenderA = randomAddress()

    const tokenB = randomAddress()
    const spenderB = randomAddress()

    const transaction = createMockSimulatedTransaction({
      transaction_info: {
        logs: [
          createMockApprovalLog({ rawAddress: tokenA, spender: spenderA }),
          createMockApprovalLog({ rawAddress: tokenB, spender: spenderB }),
        ],
      },
    })

    const [transactionA, transactionB] = extractApprovalsFromSimulation([
      transaction,
    ])

    expect(transactionA).toMatchObject({
      tokenAddress: tokenA,
      spender: spenderA,
    })
    expect(transactionB).toMatchObject({
      tokenAddress: tokenB,
      spender: spenderB,
    })
  })

  it('combines approvals across multiple transactions', () => {
    const tokenA = randomAddress()
    const spenderA = randomAddress()
    const transactionA = createMockSimulatedTransaction({
      transaction_info: {
        logs: [
          createMockApprovalLog({ rawAddress: tokenA, spender: spenderA }),
        ],
      },
    })

    const tokenB = randomAddress()
    const spenderB = randomAddress()
    const transactionB = createMockSimulatedTransaction({
      transaction_info: {
        logs: [
          createMockApprovalLog({ rawAddress: tokenB, spender: spenderB }),
        ],
      },
    })

    const [approvalTransactionA, approvalTransactionB] =
      extractApprovalsFromSimulation([transactionA, transactionB])

    expect(approvalTransactionA).toMatchObject({
      tokenAddress: tokenA,
      spender: spenderA,
    })
    expect(approvalTransactionB).toMatchObject({
      tokenAddress: tokenB,
      spender: spenderB,
    })
  })
})
