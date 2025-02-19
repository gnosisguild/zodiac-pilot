import { validateAddress } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { prefixAddress, queryInitiators } from 'ser-kit'
import type { Route } from './+types/initiators'

export const loader = async ({
  params: { address, chainId },
}: Route.LoaderArgs) => {
  const verifiedChainId = verifyChainId(parseInt(chainId))
  const validatedAddress = validateAddress(address)

  invariantResponse(validatedAddress != null, `Invalid address: ${address}`)

  try {
    const initiators = await queryInitiators(
      prefixAddress(verifiedChainId, validatedAddress),
    )

    return Response.json(initiators)
  } catch {
    return Response.json([])
  }
}
