import { render } from '@/test-utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain } from '@zodiac/chains'
import { CompanionAppMessageType } from '@zodiac/messages'
import { randomAddress } from '@zodiac/test-utils'
import { prefixAddress, queryAvatars } from 'ser-kit'
import { describe, expect, it, vi } from 'vitest'
import { useAccount } from 'wagmi'

vi.mock('wagmi', async (importOriginal) => {
  const module = await importOriginal<typeof import('wagmi')>()

  return {
    ...module,

    useAccount: vi.fn(module.useAccount),
  }
})

const mockUseAccount = vi.mocked(useAccount)

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    queryAvatars: vi.fn(),
  }
})

const mockQueryAvatars = vi.mocked(queryAvatars)

describe('New Account', () => {
  it('creates a new route with a given avatar', async () => {
    await render('/create')

    const postMessage = vi.spyOn(window, 'postMessage')

    const address = randomAddress()

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Piloted Safe' }),
      address,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: CompanionAppMessageType.SAVE_ROUTE,
        data: expect.objectContaining({
          avatar: prefixAddress(Chain.ETH, address),
        }),
      },
      '*',
    )
  })

  it('uses the selected chain', async () => {
    await render('/create')

    const postMessage = vi.spyOn(window, 'postMessage')

    const address = randomAddress()

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Piloted Safe' }),
      address,
    )

    await userEvent.click(screen.getByRole('combobox', { name: 'Chain' }))
    await userEvent.click(screen.getByRole('option', { name: 'Gnosis' }))

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: CompanionAppMessageType.SAVE_ROUTE,
        data: expect.objectContaining({
          avatar: prefixAddress(Chain.GNO, address),
        }),
      },
      '*',
    )
  })

  it('uses the connected account as initiator', async () => {
    const initiator = randomAddress()
    const avatar = randomAddress()

    mockQueryAvatars.mockResolvedValue([prefixAddress(Chain.ETH, avatar)])

    // @ts-expect-error I don't want to mock the world for this test
    mockUseAccount.mockReturnValue({
      address: initiator,
      chainId: Chain.ETH,
    })

    await render('/create')

    const postMessage = vi.spyOn(window, 'postMessage')

    await userEvent.click(
      screen.getByRole('combobox', { name: 'Piloted Safe' }),
    )
    await userEvent.click(screen.getByRole('option', { name: avatar }))

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: CompanionAppMessageType.SAVE_ROUTE,
          data: expect.objectContaining({
            initiator: prefixAddress(undefined, initiator),
          }),
        },
        '*',
      )
    })
  })

  it('is possible to give label the account', async () => {
    await render('/create')

    const postMessage = vi.spyOn(window, 'postMessage')

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Piloted Safe' }),
      randomAddress(),
    )

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Label' }),
      'Test label',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: CompanionAppMessageType.SAVE_ROUTE,
          data: expect.objectContaining({
            label: 'Test label',
          }),
        },
        '*',
      )
    })
  })
})
