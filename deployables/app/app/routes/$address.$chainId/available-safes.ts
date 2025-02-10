import { validateAddress } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { getOptionalString } from '@zodiac/form-data'
import type { ShouldRevalidateFunctionArgs } from 'react-router'
import { queryAvatars, splitPrefixedAddress, unprefixAddress } from 'ser-kit'
import { Intent } from '../edit/intents'
import type { Route } from './+types/available-safes'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { address, chainId } = params

  const verifiedChainId = verifyChainId(parseInt(chainId))
  const validatedAddress = validateAddress(address)

  invariantResponse(validatedAddress != null, `Invalid address: ${address}`)

  try {
    const routes = await queryAvatars(validatedAddress)
    console.log({ routes })

    const possibleRoutes = routes.filter((route) => {
      const [chainId] = splitPrefixedAddress(route.avatar)

      return chainId === verifiedChainId
    })

    return Response.json(
      Array.from(
        new Set(possibleRoutes.map((route) => unprefixAddress(route.avatar))),
      ),
    )
  } catch {
    return Response.json([])
  }
}

export const shouldRevalidate = ({
  formData,
  currentParams,
  nextParams,
}: ShouldRevalidateFunctionArgs) => {
  console.log({ currentParams, nextParams })
  if (currentParams.chainId !== nextParams.chainId) {
    return true
  }

  if (formData == null) {
    return false
  }

  const intent = getOptionalString(formData, 'intent')

  if (intent == null) {
    return false
  }

  return intent === Intent.ConnectWallet || intent === Intent.DisconnectWallet
}
