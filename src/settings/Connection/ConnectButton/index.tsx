import React from 'react'

import { Button } from '../../../components'
import { useConnection } from '../../connectionHooks'

import classes from './style.module.css'
import walletConnectLogoUrl from './wallet-connect-logo.png'

const ConnectButton: React.FC = () => {
  const { provider, connected } = useConnection()
  return (
    <>
      {connected ? (
        <div>
          <div>Pilot Account</div>
          <div className={classes.connectedAccount}>
            <div className={classes.walletLogo}>
              <img src={walletConnectLogoUrl} alt="wallet connect logo" />
            </div>
            <div className={classes.connectedAddress}>
              {provider.accounts[0]}
            </div>
            <Button
              onClick={() => provider.disconnect()}
              className={classes.disconnectButton}
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={async () => {
            try {
              await provider.disconnect()
              await provider.enable()
            } catch (e) {
              // When the user dismisses the modal, the connectors stays in a pending state and the modal won't open again.
              // This fixes it:
              // @ts-expect-error signer is a private property, but we didn't find another way
              provider.signer.disconnect()
            }
          }}
        >
          <img src={walletConnectLogoUrl} alt="wallet connect logo" />
          Connect Pilot Account
        </Button>
      )}
    </>
  )
}

export default ConnectButton
