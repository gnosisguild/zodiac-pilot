import {
  InjectedProviderMessageTyp,
  type InjectedProviderMessage,
} from '@/messages'
import { callListeners, chromeMock, createMockTab, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Routes } from './Routes'

describe('Routes', () => {
  it('shows an error when the user tries to connect a dApp', async () => {
    await render('/routes', [{ path: '/routes', Component: Routes }])

    await callListeners(
      chromeMock.runtime.onMessage,
      {
        type: InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST,
        request: { method: 'eth_accounts' },
        requestId: '1',
      } satisfies InjectedProviderMessage,
      { id: chromeMock.runtime.id, tab: createMockTab() },
      vi.fn(),
    )

    expect(
      screen.getByRole('alert', { name: 'No active route' }),
    ).toHaveAccessibleDescription(
      'In order to connect Zodiac Pilot to a dApp you need to launch a route.',
    )
  })
})
