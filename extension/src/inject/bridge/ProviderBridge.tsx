import { getChainId } from '@/chains'
import { useProvider } from '@/providers-ui'
import type { PropsWithChildren } from 'react'
import { parsePrefixedAddress, type PrefixedAddress } from 'ser-kit'
import { useProviderBridge } from './useProviderBridge'

export const ProviderBridge = ({
  children,
  avatar,
}: PropsWithChildren<{ avatar: PrefixedAddress }>) => {
  useProviderBridge({
    provider: useProvider(),
    chainId: getChainId(avatar),
    account: parsePrefixedAddress(avatar),
  })

  return children
}
