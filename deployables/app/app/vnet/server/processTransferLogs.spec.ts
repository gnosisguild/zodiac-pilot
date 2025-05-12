import { randomAddress, randomHex } from '@zodiac/test-utils'
import type { Log } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  ERC20_TRANSFER_TOPIC,
  processTransferLogs,
} from './processTransferLogs'

describe('processTransferLogs', () => {
  it('handles transfers with 0 value', () => {
    const address = randomAddress()

    expect(() =>
      processTransferLogs(
        {},
        [
          createMockTransferLog({
            data: '0x',
          }),
        ],
        address,
      ),
    ).not.toThrow()
  })
})

const createMockTransferLog = (log: Partial<Log> = {}): Log => ({
  topics: [ERC20_TRANSFER_TOPIC],
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
