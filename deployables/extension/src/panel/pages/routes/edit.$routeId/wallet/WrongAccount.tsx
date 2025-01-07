import { SecondaryButton, Warning } from '@zodiac/ui'
import type { PropsWithChildren } from 'react'
import { Section } from './Section'

type WrongAccountProps = PropsWithChildren<{
  onDisconnect: () => void
}>

export const WrongAccount = ({ children, onDisconnect }: WrongAccountProps) => (
  <Section>
    {children}

    <Warning title="Account is not connected">
      Switch your wallet to this account in order to use Pilot.
    </Warning>

    <SecondaryButton fluid onClick={onDisconnect}>
      Disconnect
    </SecondaryButton>
  </Section>
)
