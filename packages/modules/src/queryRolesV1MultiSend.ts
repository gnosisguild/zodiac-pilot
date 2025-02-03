import { ContractFactories, KnownContracts } from '@gnosis.pm/zodiac'
import { ZERO_ADDRESS } from '@zodiac/chains'
import { isHexAddress, type HexAddress } from '@zodiac/schema'
import type { JsonRpcProvider } from 'ethers'

export async function queryRolesV1MultiSend(
  provider: JsonRpcProvider,
  modAddress: string,
): Promise<HexAddress[]> {
  const address = await ContractFactories[KnownContracts.ROLES_V1]
    .connect(modAddress, provider)
    .multisend()

  const lowerCasedAddress = address.toLowerCase() as HexAddress

  if (!isHexAddress(lowerCasedAddress) || lowerCasedAddress === ZERO_ADDRESS) {
    return []
  }

  return [lowerCasedAddress]
}
