import {
  createMockApprovalLog,
  createMockSimulatedTransaction,
} from '@/test-utils'
import { randomAddress } from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'
import { extractApprovalsFromSimulation } from './extractApprovalsFromSimulation'

describe('extractApprovalsFromSimulation', () => {
  it('returns an empty array if logs are missing', async () => {
    const transaction = createMockSimulatedTransaction({
      transaction_info: { asset_changes: [], logs: null },
    })

    await expect(
      extractApprovalsFromSimulation([transaction]),
    ).resolves.toEqual([])
  })
  it('ignores logs that do not have name="Approval"', async () => {
    const transaction = createMockSimulatedTransaction({
      transaction_info: {
        logs: [
          {
            name: 'Transfer',
          },
        ],
      },
    })

    await expect(
      extractApprovalsFromSimulation([transaction]),
    ).resolves.toEqual([])
  })

  it('extracts approval logs correctly', async () => {
    const tokenA = randomAddress()
    const spenderA = randomAddress()
    const transaction = createMockSimulatedTransaction({
      transaction_info: {
        logs: [
          createMockApprovalLog({ rawAddress: tokenA, spender: spenderA }),
        ],
      },
    })
    const result = await extractApprovalsFromSimulation([transaction])
    expect(result).toEqual([
      {
        symbol: '',
        logoUrl: '',
        decimals: 0,
        tokenAddress: tokenA,
        spender: spenderA,
        approvalAmount: BigInt(0),
      },
    ])
  })

  it('combines approvals across multiple transactions', async () => {
    const tokenA = randomAddress()
    const spenderA = randomAddress()
    const transactionA = createMockSimulatedTransaction({
      transaction_info: {
        logs: [
          createMockApprovalLog({ rawAddress: tokenA, spender: spenderA }),
        ],
        exposure_changes: [
          {
            token_info: {
              contract_address: tokenA,
              symbol: '',
              logo: 'https://example.com/tokenA.png',
              decimals: 18,
              standard: 'ERC20',
            },
            type: 'approval',
          },
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
        exposure_changes: [
          {
            token_info: {
              contract_address: tokenB,
              symbol: 'TKB',
              logo: 'https://example.com/tokenB.png',
              decimals: 18,
              standard: 'ERC20',
            },
            type: 'approval',
          },
        ],
      },
    })

    const result = await extractApprovalsFromSimulation([
      transactionA,
      transactionB,
    ])
    expect(result).toEqual([
      {
        symbol: '',
        logoUrl: '',
        decimals: 0,
        tokenAddress: tokenA,
        spender: spenderA,
        approvalAmount: BigInt(0),
      },
      {
        symbol: '',
        logoUrl: '',
        decimals: 0,
        tokenAddress: tokenB,
        spender: spenderB,
        approvalAmount: BigInt(0),
      },
    ])
  })
})
