import { Labeled, PrimaryButton, SecondaryButton } from '@zodiac/ui'
import { ConnectKitButton, ConnectKitProvider } from 'connectkit'
import { useAccount, useDisconnect } from 'wagmi'
import { Account } from './Account'
import { Section } from './Section'

type ConnectedProps = {
  onDisconnect: () => void
}

export const Connected = ({ onDisconnect }: ConnectedProps) => {
  const { address } = useAccount()

  const { disconnect } = useDisconnect()

  if (address == null) {
    return (
      <ConnectKitProvider>
        <ConnectKitButton.Custom>
          {({ show }) => (
            <Labeled label="Pilot Account">
              <PrimaryButton onClick={show}>Connect wallet</PrimaryButton>
            </Labeled>
          )}
        </ConnectKitButton.Custom>
      </ConnectKitProvider>
    )
  }

  return (
    <Section>
      <Account>{address}</Account>

      <SecondaryButton
        fluid
        onClick={() => {
          disconnect()

          onDisconnect()
        }}
      >
        Disconnect
      </SecondaryButton>
    </Section>
  )
}
