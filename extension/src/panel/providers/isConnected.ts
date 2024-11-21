import { ChainId, parsePrefixedAddress, PrefixedAddress } from 'ser-kit'
import { InjectedWalletContextT } from './useInjectedWallet'
import { WalletConnectResult } from './useWalletConnect'

export const isConnected = (
  providerContext: InjectedWalletContextT | WalletConnectResult | null,
  account: PrefixedAddress,
  chainId: ChainId
) => {
  if (providerContext == null) {
    return false
  }

  if (providerContext.ready === false) {
    return false
  }

  if (providerContext.chainId !== chainId) {
    return false
  }

  const [, accountAddress] = parsePrefixedAddress(account)

  return providerContext.accounts.some(
    (account) => account.toLowerCase() === accountAddress.toLowerCase()
  )
}
