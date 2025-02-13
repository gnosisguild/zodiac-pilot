import { postMessage, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompanionResponseMessageType } from '@zodiac/messages'
import { encode, type ExecutionRoute } from '@zodiac/schema'
import { createMockExecutionRoute, expectRouteToBe } from '@zodiac/test-utils'
import { describe, it } from 'vitest'

describe('List Routes', () => {
  const loadRoutes = async (...routes: Partial<ExecutionRoute>[]) => {
    const mockedRoutes = routes.map(createMockExecutionRoute)

    await postMessage({
      type: CompanionResponseMessageType.LIST_ROUTES,
      routes: mockedRoutes,
    })

    return mockedRoutes
  }

  it('is possible to edit a route', async () => {
    await render('/list-routes', { version: '3.4.0' })

    const [route] = await loadRoutes({ label: 'Test route' })

    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    await expectRouteToBe(`/edit-route/${encode(route)}`)
  })
})
