import { validateAddress } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import type { ShouldRevalidateFunctionArgs } from 'react-router'
import { queryAvatars, splitPrefixedAddress, unprefixAddress } from 'ser-kit'
import type { Route } from './+types/available-safes'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { address, chainId } = params

  const verifiedChainId = verifyChainId(parseInt(chainId))
  const validatedAddress = validateAddress(address)

  invariantResponse(validatedAddress != null, `Invalid address: ${address}`)

  try {
    const avatars = await queryAvatars(validatedAddress)

    const possibleAvatars = avatars.filter((avatar) => {
      const [chainId] = splitPrefixedAddress(avatar)

      return chainId === verifiedChainId
    })

    return Response.json(
      possibleAvatars.map((avatar) => unprefixAddress(avatar)),
    )
  } catch {
    return Response.json([])
  }
}

export const shouldRevalidate = ({
  currentParams,
  nextParams,
}: ShouldRevalidateFunctionArgs) => {
  return currentParams.chainId !== nextParams.chainId
}
