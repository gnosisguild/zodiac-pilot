import React from 'react'

import { Button } from '../../../components'
import {
  useMetaMaskProvider,
  useWalletConnectProvider,
} from '../../../providers'
import { ProviderType } from '../../../types'
import { useConnection, useConnections } from '../../connectionHooks'

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

const ConnectButton: React.FC<{ id: string }> = ({ id }) => {
  const [connections, setConnections] = useConnections()
  const { connected, connection } = useConnection(id)

  const metamask = useMetaMaskProvider()
  const walletConnect = useWalletConnectProvider(connection.id)

  const connect = (providerType: ProviderType, account: string) => {
    setConnections(
      connections.map((c) =>
        c.id === id ? { ...connection, providerType, pilotAddress: account } : c
      )
    )
  }

  const disconnect = () => {
    if (connection.providerType === ProviderType.WalletConnect) {
      walletConnect.provider.disconnect()
    } else {
      // TODO: disconnect metamask
    }
  }

  return connected ? (
    <div className={classes.connectedAccount}>
      <div className={classes.walletLogo}>
        {connection.providerType === ProviderType.WalletConnect
          ? walletConnectLogo
          : metamaskLogo}
      </div>
      <div className={classes.connectedAddress}>{connection.pilotAddress}</div>
      <Button onClick={disconnect} className={classes.disconnectButton}>
        Disconnect
      </Button>
    </div>
  ) : (
    <>
      <Button
        onClick={async () => {
          try {
            await walletConnect.provider.disconnect()
            await walletConnect.provider.enable()

            connect(
              ProviderType.WalletConnect,
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
      <Button
        onClick={async () => {
          console.log(metamask)
          connect(ProviderType.Metamask, metamask.accounts[0])

          // TODO: connect metamask
        }}
      >
        {metamaskLogo}
        Connect via MetaMask
      </Button>
    </>
  )
}

export default ConnectButton
