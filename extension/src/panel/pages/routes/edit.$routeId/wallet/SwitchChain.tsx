import { CHAIN_NAME } from '@/chains'
import { SecondaryButton, Warning } from '@/components'
import type { PropsWithChildren } from 'react'
import type { ChainId } from 'ser-kit'
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
      {children}

      <Warning title="Chain mismatch">
        The connected wallet belongs to a different chain. To use it you need to
        switch back to <span className="font-semibold">{chainName}</span>
      </Warning>

      <Section.Actions>
        {onSwitch && (
          <SecondaryButton fluid onClick={onSwitch}>
            Switch wallet to {chainName}
          </SecondaryButton>
        )}

        {onDisconnect && (
          <SecondaryButton fluid onClick={onDisconnect}>
            Disconnect
          </SecondaryButton>
        )}
      </Section.Actions>
    </Section>
  )
}
