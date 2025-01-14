import { validateAddress } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { RPC, verifyChainId } from '@zodiac/chains'
import { fetchZodiacModules } from '@zodiac/modules'
import { JsonRpcProvider } from 'ethers'
import type { Route } from './+types/modules'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { avatar, chainId } = params

  const verifiedChainId = verifyChainId(parseInt(chainId))
  const validatedAddress = validateAddress(avatar)

  invariantResponse(validatedAddress != null, `Invalid address: ${avatar}`)

  try {
    console.log({ validatedAddress, verifiedChainId })

    return await fetchZodiacModules(
      new JsonRpcProvider(RPC[verifiedChainId], verifiedChainId, {
        staticNetwork: true,
      }),
      {
        safeOrModifierAddress: validatedAddress,
        chainId: verifiedChainId,
      },
    )
  } catch (e) {
    console.log(e)
    return []
  }
}
