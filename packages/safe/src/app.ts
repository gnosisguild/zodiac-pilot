import { Chain, type ChainId } from '@zodiac/chains'
import type { Hex, HexAddress } from '@zodiac/schema'
import { prefixAddress } from 'ser-kit'

// If the official Safe{Wallet} deployment at app.safe.global does not support a chain, we can use a third-party deployment.
const safeWalletHost = {
  [Chain.BOB]: 'https://safe.gobob.xyz',
} as const

export const multisigTransactionUrl = (
  chainId: ChainId,
  safeAddress: HexAddress,
  safeTxHash: Hex,
) => {
  const url = new URL(
    '/transactions/tx',
    safeWalletHost[chainId as keyof typeof safeWalletHost] ??
      'https://app.safe.global',
  )

  url.searchParams.set('safe', prefixAddress(chainId, safeAddress))
  url.searchParams.set('id', `multisig_${safeAddress}_${safeTxHash}`)

  return url
}
