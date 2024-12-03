import { SecondaryButton, Warning } from '@/components'
import { useInjectedWallet } from '@/providers'
import { PropsWithChildren } from 'react'
import { Section } from './Section'

type WalletDisconnectedProps = PropsWithChildren<{
  onReconnect: () => void
  onDisconnect: () => void
}>

export const WalletDisconnected = ({
  children,
  onReconnect,
  onDisconnect,
}: WalletDisconnectedProps) => {
  const injectedWallet = useInjectedWallet()

  return (
    <Section>
      <Warning title="Wallet disconnected">
        Your wallet is disconnected from Pilot. Reconnect it to use the selected
        account with Pilot.
      </Warning>

      {children}

      <Section.Actions>
        <SecondaryButton
          fluid
          disabled={!injectedWallet.ready}
          onClick={onReconnect}
        >
          Connect
        </SecondaryButton>

        <SecondaryButton fluid onClick={onDisconnect}>
          Disconnect
        </SecondaryButton>
      </Section.Actions>
    </Section>
  )
}
