import { jsonRpcProvider, validateAddress } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { getOptionalString } from '@zodiac/form-data'
import { fetchZodiacModules } from '@zodiac/modules'
import type { ShouldRevalidateFunction } from 'react-router'
import { Intent } from '../edit/intents'
import type { Route } from './+types/modules'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { address, chainId } = params

  const verifiedChainId = verifyChainId(parseInt(chainId))
  const validatedAddress = validateAddress(address)

  invariantResponse(validatedAddress != null, `Invalid address: ${address}`)

  try {
    const modules = await fetchZodiacModules(jsonRpcProvider(verifiedChainId), {
      safeOrModifierAddress: validatedAddress,
      chainId: verifiedChainId,
    })

    return Response.json(modules)
  } catch (e) {
    console.error(e)
    return Response.json([])
  }
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ formData }) => {
  if (formData == null) {
    return false
  }

  const intent = getOptionalString(formData, 'intent')

  if (intent == null) {
    return false
  }

  return intent === Intent.UpdateAvatar || intent === Intent.RemoveAvatar
}
