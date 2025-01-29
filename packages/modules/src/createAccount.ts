import { verifyChainId } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import type { Provider } from 'ethers'
import { createEoaAccount } from './createEoaAccount'
import { createSafeAccount } from './createSafeAccount'

export const createAccount = async (
  provider: Provider,
  address: HexAddress,
) => {
  const isEoa = (await provider.getCode(address)) === '0x'
  const network = await provider.getNetwork()

  return isEoa
    ? createEoaAccount({ address })
    : createSafeAccount({
        address,
        chainId: verifyChainId(Number(network.chainId)),
      })
}
