import { Token } from '@/components'
import { CHAIN_NAME } from '@zodiac/chains'
import type { PropsWithChildren } from 'react'
import type { ChainId } from 'ser-kit'
import { useChain } from './ChainContext'

type ChainProps = PropsWithChildren<{
  chainId: ChainId
}>

export const Chain = ({ chainId, children }: ChainProps) => {
  const chain = useChain(chainId)

  return <Token logo={chain?.logo_url}>{CHAIN_NAME[chainId] ?? children}</Token>
}
