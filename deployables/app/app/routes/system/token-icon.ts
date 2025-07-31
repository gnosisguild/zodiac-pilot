import { getVerifiedAssets } from '@/token-list'
import { verifyPrefixedAddress } from '@zodiac/schema'
import { Route } from './+types/token-icon'

export const loader = async ({
  params: { prefixedAddress },
}: Route.LoaderArgs) => {
  const [asset] = await getVerifiedAssets([
    verifyPrefixedAddress(prefixedAddress),
  ])

  return await fetch(asset.logoURI)
}
