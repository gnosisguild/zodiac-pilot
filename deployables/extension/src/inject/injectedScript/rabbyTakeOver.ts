import { sentry } from '@/sentry'
import { invariant } from '@epic-web/invariant'
import type { InjectedProvider } from './InjectedProvider'

declare let window: Window & {
  rabbyWalletRouter?: {
    rabbyEthereumProvider: any
  }
}

export const isRabbyDetected = () => window.rabbyWalletRouter != null

export const rabbyTakeOver = (provider: InjectedProvider) => {
  invariant(
    window.rabbyWalletRouter,
    'Cannot take over Rabby because Rabby is not present.',
  )

  console.debug(
    '🧑‍✈️ Rabby detected, setting Pilot as default provider in Rabby Wallet Router',
  )

  const { rabbyWalletRouter } = window

  try {
    rabbyWalletRouter.rabbyEthereumProvider._switchCurrentProvider(provider)
  } catch (e) {
    sentry.captureException(e, { data: 'Rabby take over failed' })
  }
}
