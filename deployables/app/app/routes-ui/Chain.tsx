import { Token } from '@/components'
import type { PropsWithChildren } from 'react'
import type { ChainId } from 'ser-kit'
import { useChain } from './ChainContext'

type ChainProps = PropsWithChildren<{
  chainId: ChainId
}>

export const Chain = ({ chainId, children }: ChainProps) => {
  const chain = useChain(chainId)

  return <Token logo={chain?.logo_url}>{children}</Token>
}
