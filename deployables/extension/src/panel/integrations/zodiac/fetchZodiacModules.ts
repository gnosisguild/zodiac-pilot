import { getReadOnlyProvider } from '@/providers'
import type { HexAddress } from '@/types'
import type { ZodiacModule } from '@zodiac/modules'
import { fetchZodiacModules as baseFetchZodiacModules } from '@zodiac/modules'
import { type ChainId } from 'ser-kit'

export async function fetchZodiacModules(
  safeOrModifierAddress: HexAddress,
  chainId: ChainId,
  previous?: Set<string>,
): Promise<ZodiacModule[]> {
  return baseFetchZodiacModules(getReadOnlyProvider(chainId), {
    safeOrModifierAddress,
    chainId,
    previous,
  })
}
