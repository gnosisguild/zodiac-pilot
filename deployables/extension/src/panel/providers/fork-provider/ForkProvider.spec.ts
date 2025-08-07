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
      simulationModuleAddress: randomAddress(),
    })

    provider.on('transaction', handleTransaction)

    const transaction = {
      to: randomAddress(),
      value: '0',
      data: randomHex(),
    } satisfies TransactionData

    provider.request(
      { method: 'eth_sendTransaction', params: [transaction] },
      'test-injection-id',
    )

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
      simulationModuleAddress: randomAddress(),
    })

    const transaction = {
      to: randomAddress(),
      value: '0',
      data: randomHex(),
    } satisfies TransactionData

    provider.on('transaction', () => {
      provider.emit('transactionEnd', transaction, 'result-hash')
    })

    const result = await provider.request(
      {
        method: 'eth_sendTransaction',
        params: [transaction],
      },
      'test-injection-id',
    )

    expect(result).toEqual('result-hash')
  })

  describe('EIP-5792', () => {
    it('sends calls and returns status correctly', async () => {
      const provider = new ForkProvider({
        chainId: Chain.ETH,
        avatarAddress: randomAddress(),
        simulationModuleAddress: randomAddress(),
      })

      const calls = [
        {
          to: randomAddress(),
          data: randomHex(),
          value: '0x0',
        },
      ]

      // Mock successful receipt
      const mockReceipt = {
        status: '0x1',
        blockNumber: '0x1234',
        gasUsed: '0x5208',
        effectiveGasPrice: '0x3b9aca00',
      }

      // Mock only the eth_getTransactionReceipt request
      const originalRequest = provider['provider'].request.bind(
        provider['provider'],
      )
      vi.spyOn(provider['provider'], 'request').mockImplementation(
        (request) => {
          if (request.method === 'eth_getTransactionReceipt') {
            return Promise.resolve(mockReceipt)
          }
          // For other requests, call the original implementation
          return originalRequest(request)
        },
      )

      provider.on('transaction', (transaction) => {
        provider.emit('transactionEnd', transaction, 'test-hash')
      })

      // Send calls
      const sendResult = await provider.request(
        {
          method: 'wallet_sendCalls',
          params: [{ calls, id: 'test-bundle' }],
        },
        'test-injection-id',
      )

      expect(sendResult).toEqual({ id: 'test-bundle' })

      // Get status
      const statusResult = await provider.request(
        {
          method: 'wallet_getCallsStatus',
          params: ['test-bundle'],
        },
        'test-injection-id',
      )

      expect(statusResult).toEqual({
        id: 'test-bundle',
        status: 200,
        receipts: [mockReceipt],
        atomic: true,
      })
    })

    it('throws error for duplicate id', async () => {
      const provider = new ForkProvider({
        chainId: Chain.ETH,
        avatarAddress: randomAddress(),
        simulationModuleAddress: randomAddress(),
      })

      const calls = [{ to: randomAddress(), data: randomHex(), value: '0x0' }]

      provider.on('transaction', (transaction) => {
        provider.emit('transactionEnd', transaction, 'test-hash')
      })

      // First call should succeed
      await provider.request(
        {
          method: 'wallet_sendCalls',
          params: [{ calls, id: 'duplicate-id' }],
        },
        'test-injection-id',
      )

      // Second call with same id should fail
      await expect(
        provider.request(
          {
            method: 'wallet_sendCalls',
            params: [{ calls, id: 'duplicate-id' }],
          },
          'test-injection-id',
        ),
      ).rejects.toThrow(
        'EIP-5792 call with ID duplicate-id already sent before',
      )
    })

    it('throws error for unknown bundle id', async () => {
      const provider = new ForkProvider({
        chainId: Chain.ETH,
        avatarAddress: randomAddress(),
        simulationModuleAddress: randomAddress(),
      })

      await expect(
        provider.request(
          {
            method: 'wallet_getCallsStatus',
            params: ['unknown-bundle'],
          },
          'test-injection-id',
        ),
      ).rejects.toThrow('Unknown bundle id: unknown-bundle')
    })

    it('returns capabilities', async () => {
      const provider = new ForkProvider({
        chainId: Chain.ETH,
        avatarAddress: randomAddress(),
        simulationModuleAddress: randomAddress(),
      })

      const result = await provider.request(
        {
          method: 'wallet_getCapabilities',
          params: [],
        },
        'test-injection-id',
      )

      expect(result).toEqual({
        '0x1': {
          atomicBatch: { supported: true },
        },
      })
    })
  })
})
