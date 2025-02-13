import { postMessage, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  CompanionResponseMessageType,
  PilotMessageType,
} from '@zodiac/messages'
import { encode, type ExecutionRoute } from '@zodiac/schema'
import { createMockExecutionRoute, expectRouteToBe } from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'

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
    await render('/list-routes', {
      version: '3.4.0',
    })

    const [route] = await loadRoutes({ label: 'Test route' })

    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    await postMessage({
      type: CompanionResponseMessageType.PROVIDE_ROUTE,
      route,
    })

    await expectRouteToBe(`/edit-route/${encode(route)}`)
  })

  it('disables the edit button when the extension is not connected', async () => {
    await render('/list-routes', {
      version: '3.4.0',
    })

    await loadRoutes({ label: 'Test route' })

    await postMessage({ type: PilotMessageType.PILOT_DISCONNECT })

    expect(await screen.findByRole('button', { name: 'Edit' })).toBeDisabled()
  })
})
