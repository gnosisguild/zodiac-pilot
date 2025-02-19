import { getAvailableChains } from '@/balances-server'
import { postMessage, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompanionResponseMessageType } from '@zodiac/messages'
import { encode, type ExecutionRoute } from '@zodiac/schema'
import { createMockExecutionRoute, expectRouteToBe } from '@zodiac/test-utils'
import { beforeEach, describe, it, vi } from 'vitest'

// We need to also mock stuff from edit-route because
// the tests are navigating to that route which
// will execute their code
vi.mock('@/balances-server', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/balances-server')>()

  return {
    ...module,

    getAvailableChains: vi.fn(),
  }
})

const mockGetAvailableChains = vi.mocked(getAvailableChains)

describe('List Routes', () => {
  beforeEach(() => {
    mockGetAvailableChains.mockResolvedValue([])
  })

  const loadRoutes = async (...routes: Partial<ExecutionRoute>[]) => {
    const mockedRoutes = routes.map(createMockExecutionRoute)

    await postMessage({
      type: CompanionResponseMessageType.LIST_ROUTES,
      routes: mockedRoutes,
    })

    return mockedRoutes
  }

  it('is possible to edit a route', async () => {
    await render('/edit', {
      version: '3.4.0',
    })

    const [route] = await loadRoutes({ label: 'Test route' })

    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    await postMessage({
      type: CompanionResponseMessageType.PROVIDE_ROUTE,
      route,
    })

    await expectRouteToBe(`/edit/${encode(route)}`)
  })
})
