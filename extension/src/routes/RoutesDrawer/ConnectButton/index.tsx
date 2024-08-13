import classNames from 'classnames'
import React from 'react'
import { RiAlertLine } from 'react-icons/ri'

import { Button, Flex, Tag, IconButton } from '../../../components'
import Address, { shortenAddress } from '../../../components/Address'

import { CHAIN_NAME } from '../../../chains'
import { useMetaMask, useWalletConnect } from '../../../providers'
import PUBLIC_PATH from '../../../publicPath'
import { ProviderType } from '../../../types'
import { validateAddress } from '../../../utils'
import { useRoute, useRoutes } from '../../routeHooks'

import metamaskLogoUrl from './metamask-logo.svg'
import classes from './style.module.css'
import walletConnectLogoUrl from './wallet-connect-logo.png'
import { ChainId, parsePrefixedAddress } from 'ser-kit'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from '../../legacyConnectionMigrations'
import { VscDebugDisconnect } from 'react-icons/vsc'

const walletConnectLogo = (
  <img src={PUBLIC_PATH + walletConnectLogoUrl} alt="wallet connect logo" />
)
const metamaskLogo = (
  <img
    src={PUBLIC_PATH + metamaskLogoUrl}
    alt="metamask logo"
    style={{ height: 28 }}
  />
)

const ConnectButton: React.FC<{ id: string; children: React.ReactNode }> = ({
  id,
  children,
}) => {
  const [routes, setRoutes] = useRoutes()
  const { connected, route, chainId } = useRoute(id)
  const pilotAddress =
    route.initiator && parsePrefixedAddress(route.initiator)[1].toLowerCase()

  const metamask = useMetaMask()
  const walletConnect = useWalletConnect(route.id)

  const connect = (
    providerType: ProviderType,
    chainId: ChainId,
    account: string
  ) => {
    setRoutes(
      routes.map((r) =>
        r.id === id
          ? fromLegacyConnection({
              ...asLegacyConnection(r),
              providerType,
              chainId,
              pilotAddress: account,
            })
          : r
      )
    )
  }

  const disconnect = () => {
    if (route.providerType === ProviderType.WalletConnect) {
      if (!walletConnect) {
        throw new Error('walletConnect provider is not available')
      }
      walletConnect.disconnect()
    }

    setRoutes(
      routes.map((r) =>
        r.id === id
          ? fromLegacyConnection({
              ...asLegacyConnection(route),
              pilotAddress: '',
            })
          : r
      )
    )
  }
  const Disconnect = () => (
    <Flex gap={2} alignItems={'center'}>
      {children}
      <IconButton className={classes.disconnectButton} onClick={disconnect}>
        <VscDebugDisconnect size={16} />
      </IconButton>
    </Flex>
  )

  // good to go
  if (connected && pilotAddress) {
    return (
      <div className={classes.connectedContainer}>
        <div className={classes.connectedAccount}>
          {validateAddress(pilotAddress) && <Address address={pilotAddress} />}
        </div>
        <Disconnect />
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
        <Disconnect />
      </div>
    )
  }

  // Metamask: right account, wrong chain
  if (
    route.providerType === ProviderType.MetaMask &&
    metamask.provider &&
    pilotAddress &&
    metamask.accounts.some((acc) => acc.toLowerCase() === pilotAddress) &&
    metamask.chainId !== chainId
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
        <Flex gap={2} alignItems={'center'}>
          {children}
          {chainId && (
            <Button
              className={classes.disconnectButton}
              onClick={() => {
                metamask.switchChain(chainId)
              }}
            >
              Switch wallet to {CHAIN_NAME[chainId] || `#${chainId}`}
            </Button>
          )}
        </Flex>
      </div>
    )
  }

  // MetaMask: wrong account
  if (
    route.providerType === ProviderType.MetaMask &&
    metamask.provider &&
    pilotAddress &&
    !metamask.accounts.some((acc) => acc.toLowerCase() === pilotAddress)
  ) {
    return (
      <div className={classes.connectedContainer}>
        <div className={classes.connectionWarning}>
          <Tag head={<RiAlertLine />} color="warning">
            Switch wallet to account {shortenAddress(pilotAddress)}
          </Tag>
        </div>
        <Disconnect />
      </div>
    )
  }

  // not connected
  return (
    <Flex gap={2} className={classes.connectButtonContainer}>
      <Button
        className={classes.walletButton}
        onClick={async () => {
          if (!walletConnect) {
            throw new Error('walletConnect provider is not available')
          }
          const { chainId, accounts } = await walletConnect.connect()
          connect(ProviderType.WalletConnect, chainId as ChainId, accounts[0])
        }}
      >
        {walletConnectLogo}
        Connect via WalletConnect
      </Button>
      {metamask.provider && (
        <Button
          className={classes.walletButton}
          onClick={async () => {
            const { chainId, accounts } = await metamask.connect()
            connect(ProviderType.MetaMask, chainId as ChainId, accounts[0])
          }}
        >
          {metamaskLogo}
          Connect via MetaMask
        </Button>
      )}
    </Flex>
  )
}

export default ConnectButton
