import { renderHook } from '@/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { useConnect } from './useConnect'
import { WalletConnectEthereumMultiProvider } from './WalletConnectEthereumMultiProvider'

describe('useConnect', () => {
  it('calls the onError handler when the connection failed', async () => {
    const provider = new WalletConnectEthereumMultiProvider('route-id')

    vi.spyOn(provider, 'connect').mockRejectedValue('Connect failed')
    const onError = vi.fn()

    const { result } = await renderHook(() => useConnect(provider, { onError }))

    await result.current()

    expect(onError).toHaveBeenCalled()
  })
})
