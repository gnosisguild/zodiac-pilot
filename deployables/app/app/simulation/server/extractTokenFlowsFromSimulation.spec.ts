import { getTokenDetails } from '@/balances-server'
import { createMockSimulatedTransaction } from '@/test-utils'
import { randomAddress } from '@zodiac/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { extractTokenFlowsFromSimulation } from './extractTokenFlowsFromSimulation'

const mockGetTokenDetails = vi.mocked(getTokenDetails)

describe('extractTokenFlowsFromSimulation', () => {
  it('returns empty array if transaction_info.asset_changes is empty', async () => {
    const transaction = createMockSimulatedTransaction({
      transaction_info: { asset_changes: [], logs: null },
    })

    await expect(
      extractTokenFlowsFromSimulation([transaction]),
    ).resolves.toEqual([])
  })

  it('parses ERC20 flows correctly', async () => {
    const contract = randomAddress()

    mockGetTokenDetails.mockResolvedValueOnce({
      contractId: contract,
      name: 'Mock Token',
      symbol: 'MCK',
      logoUrl: '',
      decimals: 6,
      usdPrice: 1,
      chain: 'eth',
    })

    const from = randomAddress()
    const to = randomAddress()

    const transaction = createMockSimulatedTransaction({
      transaction_info: {
        logs: null,
        asset_changes: [
          {
            from,
            to,
            raw_amount: '1000000',
            token_info: {
              standard: 'ERC20',
              contract_address: contract,
            },
          },
        ],
      },
    })

    const [flow] = await extractTokenFlowsFromSimulation([transaction])

    expect(flow).toMatchObject({
      from,
      to,
      contractId: contract,
      amount: '1',
      symbol: 'MCK',
    })
  })

  it('parses non-ERC20 (e.g. native) flows using symbol as token address', async () => {
    mockGetTokenDetails.mockResolvedValueOnce({
      contractId: 'ETH',
      name: 'Ethereum',
      symbol: 'ETH',
      logoUrl: '',
      decimals: 18,
      usdPrice: 1900,
      chain: 'eth',
    })

    const from = randomAddress()
    const to = randomAddress()

    const transaction = createMockSimulatedTransaction({
      transaction_info: {
        logs: null,
        asset_changes: [
          {
            from,
            to,
            raw_amount: '1000000000000000000',
            token_info: {
              standard: 'NATIVE',
              contract_address: 'eth',
            },
          },
        ],
      },
    })

    const [flow] = await extractTokenFlowsFromSimulation([transaction])

    expect(flow).toMatchObject({
      from,
      to,
      contractId: 'ETH',
      amount: '1',
      symbol: 'ETH',
    })
  })
})
