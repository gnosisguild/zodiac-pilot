import { Button } from '@/components'
import { PropsWithChildren } from 'react'
import { Section } from './Section'

type ConnectedProps = PropsWithChildren<{
  onDisconnect: () => void
}>

export const Connected = ({ children, onDisconnect }: ConnectedProps) => (
  <Section>
    {children}

    <Button onClick={onDisconnect}>Disconnect</Button>
  </Section>
)
