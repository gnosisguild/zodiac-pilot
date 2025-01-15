import { getReadOnlyProvider } from '@/providers'
import { queryRolesV1MultiSend as baseQueryRolesV1MultiSend } from '@zodiac/modules'
import type { ChainId } from 'ser-kit'

export const queryRolesV1MultiSend = (chainId: ChainId, modAddress: string) =>
  baseQueryRolesV1MultiSend(getReadOnlyProvider(chainId), modAddress)
