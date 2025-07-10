import { Token } from '@/components'
import { chainName } from '@zodiac/chains'
import type { ChainId } from 'ser-kit'
import { useChain } from './ChainContext'

type ChainProps = {
  chainId: ChainId
}

export const Chain = ({ chainId }: ChainProps) => {
  const chain = useChain(chainId)

  return <Token logo={chain?.logo_url}>{chainName(chainId)}</Token>
}
