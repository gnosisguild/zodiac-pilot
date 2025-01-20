import { validateAddress } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { getOptionalString } from '@zodiac/form-data'
import { initSafeApiKit } from '@zodiac/safe'
import type { ShouldRevalidateFunctionArgs } from 'react-router'
import { Intent } from '../intents'
import type { Route } from './+types/available-safes'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { chainId, account } = params

  const safeService = initSafeApiKit(verifyChainId(parseInt(chainId)))
  const validatedAddress = validateAddress(account)

  invariantResponse(validatedAddress != null, `Invalid address: ${account}`)

  try {
    const { safes } = await safeService.getSafesByOwner(validatedAddress)

    return safes
  } catch {
    return []
  }
}

export const shouldRevalidate = ({
  formData,
}: ShouldRevalidateFunctionArgs) => {
  if (formData == null) {
    return false
  }

  const intent = getOptionalString(formData, 'intent')

  if (intent == null) {
    return false
  }

  return intent === Intent.ConnectWallet || intent === Intent.DisconnectWallet
}
