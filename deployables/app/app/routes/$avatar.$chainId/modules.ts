import { jsonRpcProvider, validateAddress } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { fetchZodiacModules } from '@zodiac/modules'
import type { Route } from './+types/modules'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { avatar, chainId } = params

  const verifiedChainId = verifyChainId(parseInt(chainId))
  const validatedAddress = validateAddress(avatar)

  invariantResponse(validatedAddress != null, `Invalid address: ${avatar}`)

  try {
    return await fetchZodiacModules(jsonRpcProvider(verifiedChainId), {
      safeOrModifierAddress: validatedAddress,
      chainId: verifiedChainId,
    })
  } catch (e) {
    console.log(e)
    return []
  }
}
