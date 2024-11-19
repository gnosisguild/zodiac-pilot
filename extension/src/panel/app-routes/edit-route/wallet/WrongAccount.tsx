import { Button, Warning } from '@/components'
import { PropsWithChildren } from 'react'
import { Section } from './Section'

type WrongAccountProps = PropsWithChildren<{
  onDisconnect: () => void
}>

export const WrongAccount = ({ children, onDisconnect }: WrongAccountProps) => (
  <Section>
    <Warning title="Account is not connected">
      Switch your wallet to this account in order to use Pilot.
    </Warning>

    {children}

    <Button fluid onClick={onDisconnect}>
      Disconnect
    </Button>
  </Section>
)
