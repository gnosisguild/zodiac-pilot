import { validateAddress } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { initSafeApiKit } from '@zodiac/safe'
import type { Route } from './+types/delegates'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { chainId, address } = params

  const safeService = initSafeApiKit(verifyChainId(parseInt(chainId)))
  const validatedAddress = validateAddress(address)

  invariantResponse(validatedAddress != null, `Invalid address: ${address}`)

  try {
    const { results } = await safeService.getSafeDelegates({
      safeAddress: validatedAddress,
    })

    return Response.json(results.map((delegate) => delegate.delegate))
  } catch {
    return Response.json([])
  }
}
