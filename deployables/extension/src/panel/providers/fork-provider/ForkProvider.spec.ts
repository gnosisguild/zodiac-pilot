import type { TransactionData } from '@/types'
import { Chain } from '@zodiac/chains'
import { randomAddress, randomHex } from '@zodiac/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ForkProvider } from './ForkProvider'

describe('Fork provider', () => {
  it('emits an event when a transaction is being sent', () => {
    const handleTransaction = vi.fn()

    const provider = new ForkProvider({
      chainId: Chain.ETH,
      avatarAddress: randomAddress(),
    })

    provider.on('transaction', handleTransaction)

    const transaction = {
      to: randomAddress(),
      value: '0',
      data: randomHex(),
    } satisfies TransactionData

    provider.request({ method: 'eth_sendTransaction', params: [transaction] })

    expect(handleTransaction).toHaveBeenCalledWith({
      ...transaction,
      value: 0n,
      operation: 0,
    })
  })

  it('resolves the request with the answer that was provided through the "transactionEnd" event', async () => {
    const provider = new ForkProvider({
      chainId: Chain.ETH,
      avatarAddress: randomAddress(),
    })

    const transaction = {
      to: randomAddress(),
      value: '0',
      data: randomHex(),
    } satisfies TransactionData

    provider.on('transaction', () => {
      provider.emit('transactionEnd', transaction, 'result-hash')
    })

    const result = await provider.request({
      method: 'eth_sendTransaction',
      params: [transaction],
    })

    expect(result).toEqual('result-hash')
  })
})
