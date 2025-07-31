import { PrefixedAddress } from '@zodiac/schema'
import { getAllAssets } from './getAllAssets'

export const getVerifiedAssets = async (addresses: PrefixedAddress[]) => {
  const assets = await getAllAssets()

  return assets.filter((asset) => addresses.includes(asset.address))
}
