import { getAvailableChains } from '@/balances-server'
import { dbClient, getAccounts } from '@/db'
import {
  createMockChain,
  expectMessage,
  postMessage,
  render,
  tenantFactory,
  userFactory,
} from '@/test-utils'
import { isSmartContractAddress } from '@/utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain, CHAIN_NAME } from '@zodiac/chains'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
} from '@zodiac/messages'
import { createMockExecutionRoute, randomAddress } from '@zodiac/test-utils'
import { href, redirectDocument } from 'react-router'
import { prefixAddress } from 'ser-kit'
import { getAddress } from 'viem'
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

const mockRedirectDocument = vi.mocked(redirectDocument)

describe.sequential('New SafeAccount', () => {
  beforeEach(() => {
    mockGetAvailableChains.mockResolvedValue(
      Object.entries(CHAIN_NAME).map(([chainId, name]) =>
        createMockChain({ community_id: parseInt(chainId), name }),
      ),
    )

    mockIsSmartContractAddress.mockResolvedValue(true)
  })

  describe('Logged in', () => {
    it('creates a new account in the DB', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      await render('/create', { user })

      const address = randomAddress()

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Address' }),
        address,
      )
      await userEvent.click(
        screen.getByRole('option', { name: getAddress(address) }),
      )
      await userEvent.click(screen.getByRole('button', { name: 'Create' }))

      await expectMessage({
        type: CompanionAppMessageType.SAVE_AND_LAUNCH,
        data: expect.objectContaining({
          avatar: prefixAddress(Chain.ETH, address),
        }),
      })

      const [account] = await getAccounts(dbClient(), {
        tenantId: tenant.id,
        userId: user.id,
      })

      expect(account).toHaveProperty('address', address)
      expect(account).toHaveProperty('chainId', Chain.ETH)
      expect(account).toHaveProperty('createdById', user.id)
    })
  })

  describe('Logged out', () => {
    it('creates a new route with a given avatar', async () => {
      await render('/create')

      const address = randomAddress()

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Address' }),
        address,
      )
      await userEvent.click(
        screen.getByRole('option', { name: getAddress(address) }),
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
      await render('/create')

      const address = randomAddress()

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Address' }),
        address,
      )
      await userEvent.click(
        screen.getByRole('option', { name: getAddress(address) }),
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
  })

  describe('Label', () => {
    it('is possible to give label the account', async () => {
      await render('/create')

      const address = randomAddress()

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Address' }),
        address,
      )
      await userEvent.click(
        screen.getByRole('option', { name: getAddress(address) }),
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
      it('does a full page redirect to the balances page', async () => {
        await render('/create', { version: '3.8.2' })

        const address = randomAddress()

        await userEvent.type(
          screen.getByRole('combobox', { name: 'Address' }),
          address,
        )
        await userEvent.click(
          screen.getByRole('option', { name: getAddress(address) }),
        )

        await userEvent.click(screen.getByRole('button', { name: 'Create' }))

        await postMessage({
          type: CompanionResponseMessageType.PROVIDE_ROUTE,
          route: createMockExecutionRoute(),
        })

        expect(mockRedirectDocument).toHaveBeenCalledWith(
          href('/tokens/balances'),
        )
      })
    })
  })
})
