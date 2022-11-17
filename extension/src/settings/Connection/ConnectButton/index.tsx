import classNames from 'classnames'
import React from 'react'
import { RiAlertLine } from 'react-icons/ri'

import { Button, Flex, Tag } from '../../../components'
import { shortenAddress } from '../../../components/Address'
import { ChainId } from '../../../networks'
import { useMetaMask, useWalletConnect } from '../../../providers'
import PUBLIC_PATH from '../../../publicPath'
import { ProviderType } from '../../../types'
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
              pilotAddress: account,
            }
          : c
      )
    )
  }

  const disconnect = () => {
    if (connection.providerType === ProviderType.WalletConnect) {
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
          <div className={classes.connectedAddress}>
            {connection.pilotAddress}
          </div>
        </div>
        <Button onClick={disconnect} className={classes.disconnectButton}>
          Disconnect
        </Button>
      </div>
    )
  }

  // right account, wrong network
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
        <Tag head={<RiAlertLine />} color="warning">
          Network mismatch
        </Tag>
        <Button
          className={classes.disconnectButton}
          onClick={() => {
            metamask.provider?.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${connection.chainId?.toString(16)}` }],
            })
          }}
        >
          Switch wallet to{' '}
          {CHAIN_NAME[connection.chainId] || `#${connection.chainId}`}
        </Button>

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
            Connect to {CHAIN_NAME[metamask.chainId] || `#${metamask.chainId}`}
          </Button>
        )}
      </div>
    )
  }

  // wrong account
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

const CHAIN_NAME: Record<number, string> = {
  1: 'Ethereum',
  4: 'Rinkeby',
  5: 'Goerli',
  100: 'Gnosis Chain',
}
