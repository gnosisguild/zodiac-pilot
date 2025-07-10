import { getAvailableChains } from '@/balances-server'
import {
  createMockChain,
  expectMessage,
  postMessage,
  render,
} from '@/test-utils'
import { isSmartContractAddress } from '@/utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain, chainName } from '@zodiac/chains'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
} from '@zodiac/messages'
import { createMockExecutionRoute } from '@zodiac/modules/test-utils'
import { expectRouteToBe, randomAddress } from '@zodiac/test-utils'
import { href } from 'react-router'
import { prefixAddress } from 'ser-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/utils')>()

  return {
    ...module,

    isSmartContractAddress: vi.fn(),
  }
})

const mockIsSmartContractAddress = vi.mocked(isSmartContractAddress)
const mockGetAvailableChains = vi.mocked(getAvailableChains)

vi.mock('react-router', async (importOriginal) => {
  const module = await importOriginal<typeof import('react-router')>()

  return {
    ...module,

    redirectDocument: vi.fn(),
  }
})

describe('New SafeAccount', () => {
  beforeEach(() => {
    mockGetAvailableChains.mockResolvedValue(
      Object.values(Chain)
        .filter((value): value is number => typeof value === 'number')
        .map((chainId) =>
          createMockChain({ community_id: chainId, name: chainName(chainId) }),
        ),
    )

    mockIsSmartContractAddress.mockResolvedValue(true)
  })

  it('creates a new route with a given avatar', async () => {
    await render(href('/offline/accounts/create'))

    const address = randomAddress()

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Address' }),
      address,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await expectMessage({
      type: CompanionAppMessageType.SAVE_AND_LAUNCH,
      data: expect.objectContaining({
        avatar: prefixAddress(Chain.ETH, address),
      }),
    })
  })

  it('uses the selected chain', async () => {
    await render(href('/offline/accounts/create'))

    const address = randomAddress()

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Address' }),
      address,
    )

    await userEvent.click(screen.getByRole('combobox', { name: 'Chain' }))
    await userEvent.click(screen.getByRole('option', { name: 'Gnosis' }))

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await expectMessage({
      type: CompanionAppMessageType.SAVE_AND_LAUNCH,
      data: expect.objectContaining({
        avatar: prefixAddress(Chain.GNO, address),
      }),
    })
  })

  describe('Label', () => {
    it('is possible to give label the account', async () => {
      await render(href('/offline/accounts/create'))

      const address = randomAddress()

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Address' }),
        address,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Label' }),
        'Test label',
      )

      await userEvent.click(screen.getByRole('button', { name: 'Create' }))

      await expectMessage({
        type: CompanionAppMessageType.SAVE_AND_LAUNCH,
        data: expect.objectContaining({
          label: 'Test label',
        }),
      })
    })

    describe('Save', () => {
      it('redirects to the accounts page', async () => {
        await render(href('/offline/accounts/create'))

        const address = randomAddress()

        await userEvent.type(
          screen.getByRole('textbox', { name: 'Address' }),
          address,
        )

        await userEvent.click(screen.getByRole('button', { name: 'Create' }))

        await postMessage({
          type: CompanionResponseMessageType.PROVIDE_ROUTE,
          route: createMockExecutionRoute(),
        })

        await expectRouteToBe(href('/offline/accounts'))
      })
    })
  })
})
