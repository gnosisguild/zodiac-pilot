import { SecondaryButton } from '@/components'
import { PropsWithChildren } from 'react'
import { Section } from './Section'

type ConnectedProps = PropsWithChildren<{
  onDisconnect: () => void
}>

export const Connected = ({ children, onDisconnect }: ConnectedProps) => (
  <Section>
    {children}

    <SecondaryButton fluid onClick={onDisconnect}>
      Disconnect
    </SecondaryButton>
  </Section>
)