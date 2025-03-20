import { getTokenDetails } from '@/balances-server'
import { randomAddress } from '@zodiac/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { SimulationResult } from '../types'
import { extractTokenFlowsFromSimulation } from './extractTokenFlowsFromSimulation'

const mockGetTokenDetails = vi.mocked(getTokenDetails)

describe('extractTokenFlowsFromSimulation', () => {
  it('returns an empty array if simulation_results is undefined', async () => {
    const simulation = {} as SimulationResult
    const result = await extractTokenFlowsFromSimulation(simulation)
    expect(result).toEqual([])
  })

  it('returns empty array if transaction_info.asset_changes is empty', async () => {
    const simulation: SimulationResult = {
      simulation_results: [
        {
          transaction: {
            network_id: '1',
            transaction_info: {
              asset_changes: [],
            },
          },
        },
      ],
    } as unknown as SimulationResult

    await expect(extractTokenFlowsFromSimulation(simulation)).resolves.toEqual(
      [],
    )
  })

  it('parses ERC20 flows correctly', async () => {
    const contract = randomAddress()

    mockGetTokenDetails.mockResolvedValueOnce({
      contractId: contract,
      name: 'Mock Token',
      symbol: 'MCK',
      logoUrl: '',
      amount: '0',
      decimals: 6,
      usdValue: 0,
      usdPrice: 1,
      chain: 'eth',
    })

    const from = randomAddress()
    const to = randomAddress()

    const simulation: SimulationResult = {
      simulation_results: [
        {
          transaction: {
            network_id: '1',
            transaction_info: {
              asset_changes: [
                {
                  from,
                  to,
                  raw_amount: '1000000',
                  token_info: {
                    standard: 'ERC20',
                    contract_address: contract,
                    symbol: 'MCK',
                  },
                },
              ],
            },
          },
        },
      ],
    } as unknown as SimulationResult

    const result = await extractTokenFlowsFromSimulation(simulation)

    const [flow] = result

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
      amount: '0',
      decimals: 18,
      usdValue: 0,
      usdPrice: 1900,
      chain: 'eth',
    })

    const from = randomAddress()
    const to = randomAddress()

    const simulation: SimulationResult = {
      simulation_results: [
        {
          transaction: {
            network_id: '1',
            transaction_info: {
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
          },
        },
      ],
    }

    const result = await extractTokenFlowsFromSimulation(simulation)

    const [flow] = result

    expect(flow).toMatchObject({
      from,
      to,
      contractId: 'ETH',
      amount: '1',
      symbol: 'ETH',
    })
  })
})
