import { Alert, Button, RawAddress, Tag } from '@/components'
import { validateAddress } from '@/utils'
import { invariant } from '@epic-web/invariant'
import classNames from 'classnames'
import { ZeroAddress } from 'ethers'
import React from 'react'
import { RiAlertLine } from 'react-icons/ri'
import { ChainId, parsePrefixedAddress } from 'ser-kit'
import { CHAIN_NAME } from '../../../chains'
import { ProviderType, Route } from '../../../types'
import { useInjectedWallet, useWalletConnect } from '../../providers'
import { isConnectedTo } from '../routeHooks'
import { Account } from './Account'
import { ProviderLogo } from './ProviderLogo'
import classes from './style.module.css'

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
  let pilotAddress =
    route.initiator && parsePrefixedAddress(route.initiator)[1].toLowerCase()

  if (pilotAddress === ZeroAddress) pilotAddress = ''

  const injectedWallet = useInjectedWallet()
  const walletConnect = useWalletConnect(route.id)

  // not connected
  if (pilotAddress === '' || pilotAddress == null) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          disabled={walletConnect == null}
          onClick={async () => {
            invariant(
              walletConnect != null,
              'walletConnect provider is not available'
            )

            const { chainId, accounts } = await walletConnect.connect()
            onConnect({
              providerType: ProviderType.WalletConnect,
              chainId: chainId as ChainId,
              account: accounts[0],
            })
          }}
        >
          <ProviderLogo providerType={ProviderType.WalletConnect} />
          Connect with WalletConnect
        </Button>
        {injectedWallet.provider && (
          <Button
            disabled={!injectedWallet.connected}
            onClick={async () => {
              const { chainId, accounts } = await injectedWallet.connect()
              onConnect({
                providerType: ProviderType.InjectedWallet,
                chainId: chainId as ChainId,
                account: accounts[0],
              })
            }}
          >
            <ProviderLogo providerType={ProviderType.InjectedWallet} />
            Connect with MetaMask
          </Button>
        )}
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
    return (
      <div
        className={classNames(
          classes.connectedContainer,
          classes.connectionWarning
        )}
      >
        <RawAddress>{validateAddress(pilotAddress)}</RawAddress>
        <Tag head={<RiAlertLine />} color="warning">
          Chain mismatch
        </Tag>
        <Button
          onClick={() => walletConnect.disconnect()}
          className={classes.disconnectButton}
        >
          Disconnect
        </Button>
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
      return (
        <div
          className={classNames(
            classes.connectedContainer,
            classes.connectionWarning
          )}
        >
          <RawAddress>{validateAddress(pilotAddress)}</RawAddress>
          <Tag head={<RiAlertLine />} color="warning">
            Chain mismatch
          </Tag>
          {chainId && (
            <Button
              className={classes.disconnectButton}
              onClick={() => {
                injectedWallet.switchChain(chainId)
              }}
            >
              Switch wallet to {CHAIN_NAME[chainId] || `#${chainId}`}
            </Button>
          )}
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
