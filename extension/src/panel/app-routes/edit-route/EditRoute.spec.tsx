import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { describe, it, vi } from 'vitest'
import { EditRoute } from './EditRoute'

// vi.mock('ethers', async (importOriginal) => {
//   const pkg = await importOriginal<typeof import('ethers')>()
//   class MockProvider extends pkg.JsonRpcProvider {
//     async call(...args): Promise<string> {
//       console.log(...args)
//       return ''
//     }
//   }

//   return {
//     ...pkg,

//     JsonRpcProvider: MockProvider,
//   }
// })

vi.mock('../../providers/useWalletConnect.ts', () => ({
  default: vi.fn(),
}))

describe('Edit Zodiac route', () => {
  it('does not explode', async () => {
    render('/routes/route-id', [
      {
        path: '/routes/:routeId',
        Component: EditRoute,
      },
    ])

    await screen.findByRole('textbox', { name: 'Route label' })
  })
})
