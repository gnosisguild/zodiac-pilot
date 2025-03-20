import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Chain } from '@/balances-server'
import { getChain, getTokenDetails } from '@/balances-server'
import { verifyChainId } from '@zodiac/chains'
import type { SimulationResult } from '../types'
import { extractTokenFlowsFromSimulation } from './extractTokenFlowsFromSimulation'

vi.mock('@/balances-server', () => ({
  getChain: vi.fn(),
  getTokenDetails: vi.fn(),
}))

vi.mock('@zodiac/chains', () => ({
  verifyChainId: vi.fn(),
}))

describe('extractTokenFlowsFromSimulation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

    const result = await extractTokenFlowsFromSimulation(simulation)
    expect(result).toEqual([])
  })

  it('parses ERC20 flows correctly', async () => {
    // Setup mocks
    vi.mocked(verifyChainId).mockReturnValueOnce(1)
    vi.mocked(getChain).mockResolvedValueOnce({
      name: 'Ethereum',
      id: '1',
      community_id: 1,
      logo_url: null,
      native_token_id: 'ETH',
      wrapped_token_id: 'WETH',
      is_support_pre_exec: true,
    } as Chain)
    vi.mocked(getTokenDetails).mockResolvedValueOnce({
      contractId: '0xSomeERC20Token',
      name: 'Mock Token',
      symbol: 'MCK',
      logoUrl: '',
      amount: '0',
      decimals: 6,
      usdValue: 0,
      usdPrice: 1,
      chain: 'eth',
    })

    const simulation: SimulationResult = {
      simulation_results: [
        {
          transaction: {
            network_id: '1',
            transaction_info: {
              asset_changes: [
                {
                  from: '0xFromAddress',
                  to: '0xToAddress',
                  raw_amount: '1000000',
                  token_info: {
                    standard: 'ERC20',
                    contract_address: '0xSomeERC20Token',
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
    expect(verifyChainId).toHaveBeenCalledWith(1)
    expect(getChain).toHaveBeenCalledTimes(1)
    expect(getTokenDetails).toHaveBeenCalledTimes(1)

    expect(result).toHaveLength(1)
    const [flow] = result
    expect(flow.from).toBe('0xFromAddress')
    expect(flow.to).toBe('0xToAddress')
    expect(flow.contractId).toBe('0xSomeERC20Token')
    expect(flow.amount).toBe('1')
    expect(flow.symbol).toBe('MCK')
  })

  it('parses non-ERC20 (e.g. native) flows using symbol as token address', async () => {
    // Setup mocks
    vi.mocked(verifyChainId).mockReturnValueOnce(1)
    vi.mocked(getChain).mockResolvedValueOnce({
      id: '1',
      community_id: 1,
      name: 'Ethereum',
      logo_url: null,
      native_token_id: 'ETH',
      wrapped_token_id: 'WETH',
      is_support_pre_exec: true,
    } as Chain)
    vi.mocked(getTokenDetails).mockResolvedValueOnce({
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

    const simulation: SimulationResult = {
      simulation_results: [
        {
          transaction: {
            network_id: '1',
            transaction_info: {
              asset_changes: [
                {
                  from: '0xFromNative',
                  to: '0xToNative',
                  raw_amount: '1000000000000000000',
                  token_info: {
                    standard: 'NATIVE',
                    contract_address: null,
                    symbol: 'ETH',
                  },
                },
              ],
            },
          },
        },
      ],
    } as unknown as SimulationResult

    const result = await extractTokenFlowsFromSimulation(simulation)
    expect(result).toHaveLength(1)
    const [flow] = result
    expect(flow.from).toBe('0xFromNative')
    expect(flow.to).toBe('0xToNative')
    expect(flow.contractId).toBe('ETH')
    expect(flow.amount).toBe('1')
    expect(flow.symbol).toBe('ETH')
  })
})
