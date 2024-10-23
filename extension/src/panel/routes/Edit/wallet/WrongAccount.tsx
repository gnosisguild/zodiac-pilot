import { Alert, Button } from '@/components'
import { PropsWithChildren } from 'react'
import { Section } from './Section'

type WrongAccountProps = PropsWithChildren<{
  onDisconnect: () => void
}>

export const WrongAccount = ({ children, onDisconnect }: WrongAccountProps) => (
  <Section>
    <Alert title="Account is not connected">
      Switch your wallet to this account in order to use Pilot.
    </Alert>

    {children}

    <Button onClick={onDisconnect}>Disconnect</Button>
  </Section>
)
