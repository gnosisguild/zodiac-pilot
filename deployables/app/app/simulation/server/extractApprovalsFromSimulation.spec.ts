import { describe, expect, it } from 'vitest'
import type { SimulationResult } from '../types'
import { extractApprovalsFromSimulation } from './extractApprovalsFromSimulation'

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
                    address: '0xWd1',
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
      tokenAddress: '0xwd1',
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
                  raw: { address: '0xAbc1' },
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
                  raw: { address: '0xAbc2' },
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
      tokenAddress: '0xabc1',
      spender: '0xSpender1',
    })
    expect(result[1]).toMatchObject({
      tokenAddress: '0xabc2',
      spender: '0xSpender2',
    })
  })
})
