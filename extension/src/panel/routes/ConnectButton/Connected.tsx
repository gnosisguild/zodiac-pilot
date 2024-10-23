import { Button } from '@/components'
import { ProviderType } from '@/types'
import { Account } from './Account'
import { Section } from './Section'

type ConnectedProps = {
  providerType: ProviderType
  pilotAddress: string

  onDisconnect: () => void
}

export const Connected = ({
  providerType,
  pilotAddress,
  onDisconnect,
}: ConnectedProps) => (
  <Section>
    <Account providerType={providerType}>{pilotAddress}</Account>

    <Button onClick={onDisconnect}>Disconnect</Button>
  </Section>
)
