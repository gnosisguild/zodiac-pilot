import { validateAddress } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import type { Route } from './+types/balances'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { chainId, address } = params

  const validatedAddress = validateAddress(address)

  invariantResponse(validatedAddress != null, `Invalid address: ${address}`)

  return fetch(
    `https://airlock.gnosisguild.org/api/v1/${verifyChainId(parseInt(chainId))}/moralis/wallets/${validatedAddress}/tokens`,
  )
}
