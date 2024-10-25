import { CHAIN_NAME } from '@/chains'
import { Alert, Button } from '@/components'
import { PropsWithChildren } from 'react'
import { ChainId } from 'ser-kit'
import { Section } from './Section'

type SwitchChainProps = PropsWithChildren<{
  chainId: ChainId

  onSwitch?: () => void
  onDisconnect?: () => void
}>

export const SwitchChain = ({
  chainId,
  children,
  onSwitch,
  onDisconnect,
}: SwitchChainProps) => {
  const chainName = CHAIN_NAME[chainId] || `#${chainId}`

  return (
    <Section>
      <Alert title="Chain mismatch">
        The connected wallet belongs to a different chain. To use it you need to
        switch back to {chainName}
      </Alert>

      {children}

      <Section.Actions>
        {onSwitch && (
          <Button fluid onClick={onSwitch}>
            Switch wallet to {chainName}
          </Button>
        )}

        {onDisconnect && (
          <Button fluid onClick={onDisconnect}>
            Disconnect
          </Button>
        )}
      </Section.Actions>
    </Section>
  )
}
