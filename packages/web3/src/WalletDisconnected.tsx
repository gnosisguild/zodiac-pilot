import { SecondaryButton, Warning } from '@zodiac/ui'
import type { PropsWithChildren } from 'react'
import { LaunchConnectKit } from './LaunchConnectKit'
import { Section } from './Section'

type WalletDisconnectedProps = PropsWithChildren

export const WalletDisconnected = ({ children }: WalletDisconnectedProps) => (
  <Section>
    {children}

    <Warning title="Wallet disconnected">
      Your wallet is disconnected from Pilot. Reconnect it to use the selected
      account with Pilot.
      <Warning.Actions>
        <LaunchConnectKit>
          {({ show }) => (
            <SecondaryButton onClick={show}>Connect wallet</SecondaryButton>
          )}
        </LaunchConnectKit>
      </Warning.Actions>
    </Warning>
  </Section>
)
