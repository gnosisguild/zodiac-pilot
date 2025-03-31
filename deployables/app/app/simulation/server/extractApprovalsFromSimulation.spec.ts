import { getTokenDetails } from '@/balances-server'
import {
  createMockApprovalLog,
  createMockSimulatedTransaction,
} from '@/test-utils'
import { randomAddress } from '@zodiac/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { extractApprovalsFromSimulation } from './extractApprovalsFromSimulation'

const mockGetTokenDetails = vi.mocked(getTokenDetails)

mockGetTokenDetails.mockResolvedValue({
  contractId: randomAddress(),
  name: 'Mock Token',
  symbol: 'MCK',
  logoUrl: 'https://example.com/mock.png',
  amount: '0',
  decimals: 18,
  usdValue: 0,
  usdPrice: 1,
  chain: 'eth',
})

describe('extractApprovalsFromSimulation', () => {
  it('returns an empty array if logs are missing', async () => {
    const transaction = createMockSimulatedTransaction({
      transaction_info: { asset_changes: [] },
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
        exposure_changes: [
          {
            token_info: {
              contract_address: tokenA,
              symbol: 'TKA',
              logo: 'https://example.com/tokenA.png',
              decimals: 18,
              standard: 'ERC20',
            },
            type: 'approval',
          },
        ],
      },
    })

    const result = await extractApprovalsFromSimulation([transaction])
    expect(result).toEqual([
      {
        symbol: 'TKA',
        logoUrl: 'https://example.com/tokenA.png',
        decimals: 18,
        tokenAddress: tokenA,
        spender: spenderA,
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
              symbol: 'TKA',
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
        symbol: 'TKA',
        logoUrl: 'https://example.com/tokenA.png',
        decimals: 18,
        tokenAddress: tokenA,
        spender: spenderA,
      },
      {
        symbol: 'TKB',
        logoUrl: 'https://example.com/tokenB.png',
        decimals: 18,
        tokenAddress: tokenB,
        spender: spenderB,
      },
    ])
  })
})
