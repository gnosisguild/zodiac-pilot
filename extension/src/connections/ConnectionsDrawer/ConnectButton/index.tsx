import classNames from 'classnames'
import React from 'react'
import { RiAlertLine } from 'react-icons/ri'

import { Button, Flex, Tag } from '../../../components'
import { shortenAddress } from '../../../components/Address'
import { ChainId, CHAIN_NAME } from '../../../chains'
import { useMetaMask, useWalletConnect } from '../../../providers'
import PUBLIC_PATH from '../../../publicPath'
import { ProviderType } from '../../../types'
import { validateAddress } from '../../../utils'
import { useConnection, useConnections } from '../../connectionHooks'

import metamaskLogoUrl from './metamask-logo.svg'
import classes from './style.module.css'
import walletConnectLogoUrl from './wallet-connect-logo.png'

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

const ConnectButton: React.FC<{ id: string }> = ({ id }) => {
  const [connections, setConnections] = useConnections()
  const { connected, connection } = useConnection(id)

  const metamask = useMetaMask()
  const walletConnect = useWalletConnect(connection.id)

  const connect = (
    providerType: ProviderType,
    chainId: ChainId,
    account: string
  ) => {
    setConnections(
      connections.map((c) =>
        c.id === id
          ? {
              ...connection,
              providerType,
              chainId,
              pilotAddress: account.toLowerCase(),
            }
          : c
      )
    )
  }

  const disconnect = () => {
    if (connection.providerType === ProviderType.WalletConnect) {
      if (!walletConnect) {
        throw new Error('walletConnect provider is not available')
      }
      walletConnect.disconnect()
    }

    setConnections(
      connections.map((c) =>
        c.id === id ? { ...connection, pilotAddress: '' } : c
      )
    )
  }

  // good to go
  if (connected) {
    return (
      <div className={classes.connectedContainer}>
        <div className={classes.connectedAccount}>
          <div className={classes.walletLogo}>
            {connection.providerType === ProviderType.WalletConnect
              ? walletConnectLogo
              : metamaskLogo}
          </div>
          <code className={classes.pilotAddress}>
            {validateAddress(connection.pilotAddress)}
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
    connection.providerType === ProviderType.WalletConnect &&
    walletConnect &&
    connection.pilotAddress &&
    walletConnect.accounts.some(
      (acc) => acc.toLowerCase() === connection.pilotAddress
    ) &&
    connection.chainId &&
    walletConnect.chainId !== connection.chainId
  ) {
    return (
      <div
        className={classNames(
          classes.connectedContainer,
          classes.connectionWarning
        )}
      >
        <code className={classes.pilotAddress}>
          {validateAddress(connection.pilotAddress)}
        </code>
        <Tag head={<RiAlertLine />} color="warning">
          Chain mismatch
        </Tag>
        {walletConnect.chainId && (
          <Button
            className={classes.disconnectButton}
            onClick={() => {
              connect(
                ProviderType.WalletConnect,
                walletConnect.chainId as ChainId,
                connection.pilotAddress
              )
            }}
          >
            Connect to{' '}
            {CHAIN_NAME[walletConnect.chainId as ChainId] ||
              `#${walletConnect.chainId}`}
          </Button>
        )}
      </div>
    )
  }

  // Metamask: right account, wrong chain
  if (
    connection.providerType === ProviderType.MetaMask &&
    metamask.provider &&
    connection.pilotAddress &&
    metamask.accounts.includes(connection.pilotAddress) &&
    connection.chainId &&
    metamask.chainId !== connection.chainId
  ) {
    return (
      <div
        className={classNames(
          classes.connectedContainer,
          classes.connectionWarning
        )}
      >
        <code className={classes.pilotAddress}>
          {validateAddress(connection.pilotAddress)}
        </code>
        <Tag head={<RiAlertLine />} color="warning">
          Chain mismatch
        </Tag>
        {connection.chainId && (
          <Button
            className={classes.disconnectButton}
            onClick={() => {
              if (connection.chainId) {
                metamask.switchChain(connection.chainId)
              }
            }}
          >
            Switch wallet to{' '}
            {CHAIN_NAME[connection.chainId] || `#${connection.chainId}`}
          </Button>
        )}

        {metamask.chainId && (
          <Button
            className={classes.disconnectButton}
            onClick={() => {
              connect(
                ProviderType.MetaMask,
                metamask.chainId as ChainId,
                connection.pilotAddress
              )
            }}
          >
            Connect to{' '}
            {CHAIN_NAME[metamask.chainId as ChainId] || `#${metamask.chainId}`}
          </Button>
        )}
      </div>
    )
  }

  // MetaMask: wrong account
  if (
    connection.providerType === ProviderType.MetaMask &&
    metamask.provider &&
    connection.pilotAddress &&
    !metamask.accounts.includes(connection.pilotAddress)
  ) {
    return (
      <div className={classes.connectedContainer}>
        <div className={classes.connectionWarning}>
          <Tag head={<RiAlertLine />} color="warning">
            Switch wallet to account {shortenAddress(connection.pilotAddress)}
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
