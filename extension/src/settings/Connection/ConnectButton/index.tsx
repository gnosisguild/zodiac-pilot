import React from 'react'

import { Button } from '../../../components'
import {
  useMetaMaskProvider,
  useWalletConnectProvider,
} from '../../../providers'
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

  const metamask = useMetaMaskProvider()
  const walletConnect = useWalletConnectProvider(connection.id)

  const connect = (
    providerType: ProviderType,
    chainId: number | null,
    account: string
  ) => {
    setConnections(
      connections.map((c) =>
        c.id === id
          ? { ...connection, providerType, chainId, pilotAddress: account }
          : c
      )
    )
  }

  const disconnect = () => {
    if (connection.providerType === ProviderType.WalletConnect) {
      walletConnect.provider.disconnect()
    }

    setConnections(
      connections.map((c) =>
        c.id === id ? { ...connection, pilotAddress: '' } : c
      )
    )
  }

  if (connected) {
    return (
      <div className={classes.connectedAccount}>
        <div className={classes.walletLogo}>
          {connection.providerType === ProviderType.WalletConnect
            ? walletConnectLogo
            : metamaskLogo}
        </div>
        <div className={classes.connectedAddress}>
          {connection.pilotAddress}
        </div>
        <Button onClick={disconnect} className={classes.disconnectButton}>
          Disconnect
        </Button>
      </div>
    )
  }

  if (
    metamask.provider &&
    connection.chainId &&
    metamask.chainId !== connection.chainId
  ) {
    return (
      <Button
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
    )
  }

  if (
    metamask.provider &&
    connection.pilotAddress &&
    !metamask.accounts.includes(connection.pilotAddress)
  ) {
    return (
      <div className={classes.connectedAccount}>
        <div className={classes.connectedAddress}>
          Switch wallet to account {connection.pilotAddress}
        </div>
        <Button onClick={disconnect} className={classes.disconnectButton}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={async () => {
          try {
            await walletConnect.provider.disconnect()
            await walletConnect.provider.enable()

            connect(
              ProviderType.WalletConnect,
              walletConnect.provider.chainId,
              walletConnect.provider.accounts[0]
            )
          } catch (e) {
            // When the user dismisses the modal, the connectors stays in a pending state and the modal won't open again.
            // This fixes it:
            // @ts-expect-error signer is a private property, but we didn't find another way
            walletConnect.provider.signer.disconnect()
          }
        }}
      >
        {walletConnectLogo}
        Connect via WalletConnect
      </Button>
      {metamask.provider && (
        <Button
          onClick={() => {
            connect(
              ProviderType.MetaMask,
              metamask.chainId,
              metamask.accounts[0]
            )
          }}
        >
          {metamaskLogo}
          Connect via MetaMask
        </Button>
      )}
    </>
  )
}

export default ConnectButton

const CHAIN_NAME: Record<number, string> = {
  1: 'Ethereum',
  4: 'Rinkeby',
  100: 'Gnosis Chain',
}