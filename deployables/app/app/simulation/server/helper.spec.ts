import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Chain } from '@/balances-server'
import { getChain, getTokenDetails } from '@/balances-server'
import { verifyChainId } from '@zodiac/chains'
import type { SimulationResult } from '../types'
import {
  extractApprovalsFromSimulation,
  extractTokenFlowsFromSimulation,
} from './helper'

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

describe('extractApprovalsFromSimulation', () => {
  it('returns an empty array if simulation_results is undefined', () => {
    const simulation = {} as SimulationResult
    const result = extractApprovalsFromSimulation(simulation)
    expect(result).toEqual([])
  })

  it('returns an empty array if logs is missing or not an array', () => {
    const simulation: SimulationResult = {
      simulation_results: [
        {
          transaction: {
            // no transaction_info.logs
            transaction_info: {},
          },
        },
      ],
    } as SimulationResult

    const result = extractApprovalsFromSimulation(simulation)
    expect(result).toEqual([])
  })

  it('ignores logs that do not have name="Approval"', () => {
    const simulation: SimulationResult = {
      simulation_results: [
        {
          transaction: {
            transaction_info: {
              logs: [
                {
                  name: 'Transfer',
                  raw: { address: '0xSomeRandomToken' },
                  inputs: [
                    { name: 'from', value: '0xFoo' },
                    { name: 'to', value: '0xBar' },
                  ],
                },
              ],
            },
          },
        },
      ],
    } as SimulationResult

    const result = extractApprovalsFromSimulation(simulation)
    expect(result).toEqual([])
  })

  it('extracts approval logs correctly', () => {
    const simulation: SimulationResult = {
      simulation_results: [
        {
          transaction: {
            transaction_info: {
              logs: [
                {
                  name: 'Approval',
                  raw: {
                    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                  },
                  inputs: [
                    { name: 'owner', value: '0xOwner' },
                    { name: 'spender', value: '0xSpender' },
                    { name: 'value', value: '9999' },
                  ],
                },
                {
                  name: 'Approval',
                  raw: {
                    address: '0xAnotherToken',
                  },
                  inputs: [
                    { name: 'owner', value: '0xOwner2' },
                    { name: 'spender', value: '0xSpender2' },
                    { name: 'value', value: '1234' },
                  ],
                },
              ],
            },
          },
        },
      ],
    } as SimulationResult

    const result = extractApprovalsFromSimulation(simulation)
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      spender: '0xSpender',
    })
    expect(result[1]).toMatchObject({
      tokenAddress: '0xAnotherToken',
      spender: '0xSpender2',
    })
  })

  it('combines approvals across multiple transactions', () => {
    const simulation: SimulationResult = {
      simulation_results: [
        {
          transaction: {
            transaction_info: {
              logs: [
                {
                  name: 'Approval',
                  raw: { address: '0xToken1' },
                  inputs: [
                    { name: 'owner', value: '0xOwner1' },
                    { name: 'spender', value: '0xSpender1' },
                    { name: 'value', value: '111' },
                  ],
                },
              ],
            },
          },
        },
        {
          transaction: {
            transaction_info: {
              logs: [
                {
                  name: 'Approval',
                  raw: { address: '0xToken2' },
                  inputs: [
                    { name: 'owner', value: '0xOwner2' },
                    { name: 'spender', value: '0xSpender2' },
                    { name: 'value', value: '222' },
                  ],
                },
              ],
            },
          },
        },
      ],
    } as SimulationResult

    const result = extractApprovalsFromSimulation(simulation)
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      tokenAddress: '0xToken1',
      spender: '0xSpender1',
    })
    expect(result[1]).toMatchObject({
      tokenAddress: '0xToken2',
      spender: '0xSpender2',
    })
  })
})
