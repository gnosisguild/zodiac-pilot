import { SecondaryButton } from '@zodiac/ui'
import type { PropsWithChildren } from 'react'
import { Section } from './Section'

type ConnectedProps = PropsWithChildren<{
  onDisconnect: () => void
}>

export const Connected = ({ children, onDisconnect }: ConnectedProps) => (
  <Section>
    {children}

    <Section.Actions>
      <SecondaryButton onClick={onDisconnect}>Disconnect</SecondaryButton>
    </Section.Actions>
  </Section>
)
