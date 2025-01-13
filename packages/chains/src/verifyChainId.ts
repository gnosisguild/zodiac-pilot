import { chainIdSchema } from '@zodiac/schema'
import type { ChainId } from 'ser-kit'

export const verifyChainId = (chainId: number): ChainId =>
  chainIdSchema.parse(chainId)
