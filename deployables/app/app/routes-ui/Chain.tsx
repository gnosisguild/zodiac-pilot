import { Token } from '@/components'
import { chainName } from '@zodiac/chains'
import { href } from 'react-router'
import type { ChainId } from 'ser-kit'

type ChainProps = {
  chainId: ChainId
}

export const Chain = ({ chainId }: ChainProps) => {
  return (
    <Token
      logo={href('/system/chain-icon/:chainId', { chainId: `${chainId}` })}
    >
      {chainName(chainId)}
    </Token>
  )
}
