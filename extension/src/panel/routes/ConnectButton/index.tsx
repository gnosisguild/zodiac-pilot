import { Alert, Button } from '@/components'
import { invariant } from '@epic-web/invariant'
import { ZeroAddress } from 'ethers'
import React from 'react'
import { ChainId, parsePrefixedAddress } from 'ser-kit'
import { CHAIN_NAME } from '../../../chains'
import { ProviderType, Route } from '../../../types'
import { useInjectedWallet, useWalletConnect } from '../../providers'
import { isConnectedTo } from '../routeHooks'
import { Account } from './Account'
import { InjectedWalletConnect } from './injectedWallet'
import { WalletConnectConnect } from './walletConnect'

interface Props {
  route: Route
  onConnect(args: {
    providerType: ProviderType
    chainId: ChainId
    account: string
  }): void
  onDisconnect(): void
}

const ConnectButton: React.FC<Props> = ({ route, onConnect, onDisconnect }) => {
  const pilotAddress = getPilotAddress(route)

  const injectedWallet = useInjectedWallet()
  const walletConnect = useWalletConnect(route.id)

  // not connected
  if (pilotAddress == null) {
    return (
      <div className="flex flex-col gap-2">
        <WalletConnectConnect
          routeId={route.id}
          onConnect={(chainId, account) =>
            onConnect({
              providerType: ProviderType.WalletConnect,
              chainId,
              account,
            })
          }
        />

        <InjectedWalletConnect
          onConnect={(chainId, account) =>
            onConnect({
              providerType: ProviderType.InjectedWallet,
              chainId,
              account,
            })
          }
        />
      </div>
    )
  }

  const isWalletConnectWallet =
    route.providerType === ProviderType.WalletConnect
  const walletConnectProviderAvailable = walletConnect != null

  const isInjectedWallet = route.providerType === ProviderType.InjectedWallet

  // atm, we don't yet support cross-chain routes, so can derive a general chainId from the avatar
  const [chainId] = parsePrefixedAddress(route.avatar)

  invariant(chainId != null, 'chainId is empty')

  const connected =
    route.initiator &&
    isConnectedTo(
      isInjectedWallet ? injectedWallet : walletConnect,
      route.initiator,
      chainId
    )

  // good to go
  if (connected) {
    return (
      <div className="flex flex-col gap-4">
        <Account providerType={route.providerType}>{pilotAddress}</Account>

        <Button
          onClick={() => {
            if (isWalletConnectWallet) {
              invariant(
                walletConnectProviderAvailable,
                'walletConnect provider is not available'
              )

              walletConnect.disconnect()
            }

            onDisconnect()
          }}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  // WalletConnect: wrong chain
  if (
    isWalletConnectWallet &&
    walletConnect &&
    walletConnect.accounts.some((acc) => acc.toLowerCase() === pilotAddress) &&
    walletConnect.chainId !== chainId
  ) {
    const chainName = CHAIN_NAME[chainId] || `#${chainId}`

    return (
      <div className="flex flex-col gap-4">
        <Account providerType={route.providerType}>{pilotAddress}</Account>

        <Alert title="Chain mismatch">
          The connected wallet belongs to a different chain. Connect a wallet on{' '}
          {chainName} to use Pilot.
        </Alert>

        <Button onClick={() => walletConnect.disconnect()}>Disconnect</Button>
      </div>
    )
  }

  // Injected wallet
  if (isInjectedWallet && injectedWallet.provider) {
    const accountInWallet = injectedWallet.accounts.some(
      (acc) => acc.toLowerCase() === pilotAddress
    )

    // Wallet disconnected
    if (injectedWallet.accounts.length === 0) {
      return (
        <div className="flex flex-col gap-4">
          <Alert title="Wallet disconnected">
            Your wallet is disconnected from Pilot. Reconnect it to use the
            selected account with Pilot.
          </Alert>
          <Account providerType={route.providerType}>{pilotAddress}</Account>

          <div className="flex justify-end gap-2">
            <Button onClick={() => injectedWallet.connect()}>Connect</Button>
            <Button onClick={onDisconnect}>Disconnect</Button>
          </div>
        </div>
      )
    }

    // Injected wallet: right account, wrong chain
    if (accountInWallet && injectedWallet.chainId !== chainId) {
      const chainName = CHAIN_NAME[chainId] || `#${chainId}`

      return (
        <div className="flex flex-col gap-4">
          <Alert title="Chain mismatch">
            The connected wallet belongs to a different chain. To use it you
            need to switch back to {chainName}
          </Alert>

          <Account providerType={route.providerType}>{pilotAddress}</Account>

          <Button
            onClick={() => {
              injectedWallet.switchChain(chainId)
            }}
          >
            Switch wallet to {chainName}
          </Button>
        </div>
      )
    }

    // Wrong account
    if (!accountInWallet) {
      return (
        <div className="flex flex-col gap-4">
          <Alert title="Account is not connected">
            Switch your wallet to this account in order to use Pilot.
          </Alert>

          <Account providerType={route.providerType}>{pilotAddress}</Account>

          <Button onClick={onDisconnect}>Disconnect</Button>
        </div>
      )
    }
  }
}

export default ConnectButton

const getPilotAddress = (route: Route) => {
  if (route.initiator == null) {
    return null
  }

  const address = parsePrefixedAddress(route.initiator)[1].toLowerCase()

  if (address === ZeroAddress) {
    return null
  }

  return address
}
