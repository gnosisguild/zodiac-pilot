import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { CHAIN_NAME } from '@zodiac/chains'
import {
  createMockExecutionRoute,
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import type { ChainId } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import EditRoute, { loader } from './edit-route'

describe('Edit route', () => {
  describe('Label', () => {
    it('shows the name of a route', async () => {
      const route = createMockExecutionRoute({ label: 'Test route' })

      await render<typeof import('./edit-route')>(
        '/edit-route',
        { path: '/edit-route', Component: EditRoute, loader },
        { searchParams: { route: btoa(JSON.stringify(route)) } },
      )

      expect(screen.getByRole('textbox', { name: 'Label' })).toHaveValue(
        'Test route',
      )
    })
  })

  describe('Chain', () => {
    it.each(Object.entries(CHAIN_NAME))(
      'shows chainId "%s" as "%s"',
      async (chainId, name) => {
        const route = createMockExecutionRoute({
          avatar: randomPrefixedAddress({
            chainId: parseInt(chainId) as ChainId,
          }),
        })

        await render<typeof import('./edit-route')>(
          '/edit-route',
          { path: '/edit-route', Component: EditRoute, loader },
          { searchParams: { route: btoa(JSON.stringify(route)) } },
        )

        expect(screen.getByText(name)).toBeInTheDocument()
      },
    )
  })

  describe('Avatar', () => {
    it('shows the avatar of a route', async () => {
      const avatar = randomAddress()

      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress({ address: avatar }),
      })

      await render<typeof import('./edit-route')>(
        '/edit-route',
        { path: '/edit-route', Component: EditRoute, loader },
        { searchParams: { route: btoa(JSON.stringify(route)) } },
      )

      expect(screen.getByText(avatar)).toBeInTheDocument()
    })
  })
})
