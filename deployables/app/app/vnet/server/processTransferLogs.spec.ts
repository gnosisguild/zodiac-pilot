import { verifyHexAddress } from '@zodiac/schema'
import { randomAddress, randomHex } from '@zodiac/test-utils'
import { type Log } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  ERC20_TRANSFER_TOPIC,
  TENDERLY_ADD_ERC20_BALANCE_TOPIC,
  processTransferLogs,
} from './processTransferLogs'

describe('processTransferLogs', () => {
  it('handles transfers with 0 value', () => {
    const address = randomAddress()

    expect(() =>
      processTransferLogs(
        {},
        [
          createMockLog(ERC20_TRANSFER_TOPIC, {
            data: '0x',
          }),
        ],
        address,
      ),
    ).not.toThrow()
  })

  it('handles Tenderly add ERC20 balance logs correctly', () => {
    const mockLogData =
      '0x0000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf127000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001234567890123456789012345678901234567890'
    const avatarAddress = verifyHexAddress(
      '0x1234567890123456789012345678901234567890',
    )
    const tokenAddress = verifyHexAddress(
      '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    )
    const amount = 1000000000000000000n // 1 ETH in wei

    const result = processTransferLogs(
      {},
      [
        createMockLog(TENDERLY_ADD_ERC20_BALANCE_TOPIC, {
          data: mockLogData,
        }),
      ],
      avatarAddress,
    )

    // Avatar receives tokens => should increase delta
    expect(result[tokenAddress]).toBe(amount)
  })
})

const createMockLog = (topic: `0x${string}`, log: Partial<Log> = {}): Log => ({
  topics: [topic],
  address: randomAddress(),
  data: randomHex(),
  blockHash: null,
  blockNumber: null,
  logIndex: null,
  removed: false,
  transactionHash: randomHex(),
  transactionIndex: null,
  ...log,
})
