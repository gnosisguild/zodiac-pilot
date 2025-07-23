import { SecondaryButton, Warning } from '@zodiac/ui'
import type { PropsWithChildren } from 'react'
import { Section } from './Section'

type WrongAccountProps = PropsWithChildren<{
  onDisconnect: () => void
}>

export const WrongAccount = ({ children, onDisconnect }: WrongAccountProps) => (
  <Section>
    {children}

    <Warning title="Wallet is set to a different account">
      Switch your wallet to this account in order to use Pilot.
      <Warning.Actions>
        <SecondaryButton onClick={onDisconnect}>Disconnect</SecondaryButton>
      </Warning.Actions>
    </Warning>
  </Section>
)
