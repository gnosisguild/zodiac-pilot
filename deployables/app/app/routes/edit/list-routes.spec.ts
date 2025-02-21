import { getAvailableChains } from '@/balances-server'
import { loadRoutes, postMessage, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompanionResponseMessageType } from '@zodiac/messages'
import { encode } from '@zodiac/schema'
import { createMockExecutionRoute, expectRouteToBe } from '@zodiac/test-utils'
import { beforeEach, describe, it, vi } from 'vitest'

const mockGetAvailableChains = vi.mocked(getAvailableChains)

describe('List Routes', () => {
  beforeEach(() => {
    mockGetAvailableChains.mockResolvedValue([])
  })

  it('is possible to edit a route', async () => {
    const route = createMockExecutionRoute({ label: 'Test route' })

    await render('/edit', {
      version: '3.4.0',
      availableRoutes: [route],
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    await postMessage({
      type: CompanionResponseMessageType.PROVIDE_ROUTE,
      route,
    })

    await loadRoutes()

    await expectRouteToBe(`/edit/${encode(route)}`)
  })
})
