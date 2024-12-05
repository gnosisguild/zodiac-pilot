import { expectRouteToBe, mockRoutes, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NewRoute } from './NewRoute'

const { mockCreateRoute } = vi.hoisted(() => ({ mockCreateRoute: vi.fn() }))

vi.mock('@/execution-routes', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/execution-routes')>()

  return {
    ...module,

    useCreateExecutionRoute: () => mockCreateRoute,
  }
})

describe('New route', () => {
  beforeEach(() => {
    mockRoutes()
  })

  describe('Label', () => {
    it('shows "Unnamed route" by default', async () => {
      await render('/routes/new', [
        { path: '/routes/new', Component: NewRoute },
      ])

      expect(
        screen.getByRole('heading', { name: 'New route' })
      ).toBeInTheDocument()
    })

    it('is possible to change the title of the route', async () => {
      await render('/routes/new', [
        { path: '/routes/new', Component: NewRoute },
      ])

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Route label' }),
        'Test route'
      )

      expect(
        screen.getByRole('heading', { name: 'Test route' })
      ).toBeInTheDocument()
    })

    it('is possible to save the route with just a label', async () => {
      await render(
        '/routes/new',
        [{ path: '/routes/new', Component: NewRoute }],
        { inspectRoutes: ['/'] }
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Route label' }),
        'Test route'
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Launch' })
      )

      expect(mockCreateRoute).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'Test route' })
      )

      await expectRouteToBe('/')
    })
  })

  describe('Chain', () => {
    it('allows to configure the chain', async () => {
      await render('/routes/new', [
        { path: '/routes/new', Component: NewRoute },
      ])

      await userEvent.click(screen.getByRole('combobox', { name: 'Chain' }))
      await userEvent.click(
        screen.getByRole('option', { name: 'Arbitrum One' })
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Launch' })
      )

      expect(mockCreateRoute).toHaveBeenCalledWith(
        expect.objectContaining({ chainId: 42161 })
      )
    })
  })
})
