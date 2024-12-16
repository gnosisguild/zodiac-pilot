import { renderHook, RenderWrapper } from '@/test-utils'
import { invariant } from '@epic-web/invariant'
import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useConnectProvider } from './useConnectProvider'

describe('useConnectProvider', () => {
  describe('Connection fails', () => {
    it('makes the information that a connection has failed accessible', async () => {
      const { result } = await renderHook(() => useConnectProvider(), {
        wrapper: RenderWrapper,
      })

      invariant(
        result.current.provider != null,
        'Provider did not connect, yet.',
      )

      vi.spyOn(result.current.provider, 'request').mockRejectedValue({
        message: 'Error',
      })

      await result.current.connect()

      await waitFor(() => {
        expect(result.current).toHaveProperty('connectionStatus', 'error')
      })
    })
  })
})
