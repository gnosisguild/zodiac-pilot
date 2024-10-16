import classNames from 'classnames'
import { ZeroAddress } from 'ethers'
import React from 'react'
import { RiAlertLine } from 'react-icons/ri'
import { ChainId, parsePrefixedAddress } from 'ser-kit'
import { CHAIN_NAME } from '../../../chains'
import { Button, Flex, Tag } from '../../../components'
import { shortenAddress } from '../../../components/Address'
import { ProviderType, Route } from '../../../types'
import { useInjectedWallet, useWalletConnect } from '../../providers'
import { validateAddress } from '../../utils'
import { isConnectedTo } from '../routeHooks'
import metamaskLogoUrl from './metamask-logo.svg'
import classes from './style.module.css'
import walletConnectLogoUrl from './wallet-connect-logo.png'

const walletConnectLogo = (
  <img
    src={chrome.runtime.getURL(walletConnectLogoUrl)}
    alt="wallet connect logo"
  />
)
const metamaskLogo = (
  <img
    src={chrome.runtime.getURL(metamaskLogoUrl)}
    alt="metamask logo"
    style={{ height: 28 }}
  />
)

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

  const disconnect = () => {
    if (route.providerType === ProviderType.WalletConnect) {
      if (!walletConnect) {
        throw new Error('walletConnect provider is not available')
      }
      walletConnect.disconnect()
    }

    onDisconnect()
  }

  // atm, we don't yet support cross-chain routes, so can derive a general chainId from the avatar
  const [chainId] = parsePrefixedAddress(route.avatar)
  if (!chainId) {
    throw new Error('chainId is empty')
  }

  const connected =
    route.initiator &&
    isConnectedTo(
      route.providerType === ProviderType.InjectedWallet
        ? injectedWallet
        : walletConnect,
      route.initiator,
      chainId
    )

  console.log({ connected, pilotAddress, route, chainId })

  // good to go
  if (connected && pilotAddress) {
    return (
      <div className={classes.connectedContainer}>
        <div className={classes.connectedAccount}>
          <div className={classes.walletLogo}>
            {route.providerType === ProviderType.WalletConnect
              ? walletConnectLogo
              : metamaskLogo}
          </div>
          <code className={classes.pilotAddress}>
            {validateAddress(pilotAddress)}
          </code>
        </div>
        <Button onClick={disconnect} className={classes.disconnectButton}>
          Disconnect
        </Button>
      </div>
    )
  }

  // WalletConnect: wrong chain
  if (
    route.providerType === ProviderType.WalletConnect &&
    walletConnect &&
    pilotAddress &&
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
        <code className={classes.pilotAddress}>
          {validateAddress(pilotAddress)}
        </code>
        <Tag head={<RiAlertLine />} color="warning">
          Chain mismatch
        </Tag>
        <Button onClick={disconnect} className={classes.disconnectButton}>
          Disconnect
        </Button>
      </div>
    )
  }

  // Injected wallet: right account, wrong chain
  if (
    route.providerType === ProviderType.InjectedWallet &&
    injectedWallet.provider &&
    pilotAddress &&
    injectedWallet.accounts.some((acc) => acc.toLowerCase() === pilotAddress) &&
    injectedWallet.chainId !== chainId
  ) {
    return (
      <div
        className={classNames(
          classes.connectedContainer,
          classes.connectionWarning
        )}
      >
        <code className={classes.pilotAddress}>
          {validateAddress(pilotAddress)}
        </code>
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

  // Injected wallet: wrong account
  if (
    route.providerType === ProviderType.InjectedWallet &&
    injectedWallet.provider &&
    pilotAddress &&
    !injectedWallet.accounts.some((acc) => acc.toLowerCase() === pilotAddress)
  ) {
    return (
      <div className={classes.connectedContainer}>
        <div className={classes.connectionWarning}>
          <Tag head={<RiAlertLine />} color="warning">
            Switch wallet to account {shortenAddress(pilotAddress)}
          </Tag>
        </div>
        <Button onClick={disconnect} className={classes.disconnectButton}>
          Disconnect
        </Button>
      </div>
    )
  }

  // not connected
  return (
    <Flex gap={2}>
      <Button
        className={classes.walletButton}
        onClick={async () => {
          if (!walletConnect) {
            throw new Error('walletConnect provider is not available')
          }
          const { chainId, accounts } = await walletConnect.connect()
          onConnect({
            providerType: ProviderType.WalletConnect,
            chainId: chainId as ChainId,
            account: accounts[0],
          })
        }}
      >
        {walletConnectLogo}
        Connect with WalletConnect
      </Button>
      {injectedWallet.provider && (
        <Button
          className={classes.walletButton}
          onClick={async () => {
            const { chainId, accounts } = await injectedWallet.connect()
            onConnect({
              providerType: ProviderType.InjectedWallet,
              chainId: chainId as ChainId,
              account: accounts[0],
            })
          }}
        >
          {metamaskLogo}
          Connect with MetaMask
        </Button>
      )}
    </Flex>
  )
}

export default ConnectButton
