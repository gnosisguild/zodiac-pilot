import { Provider } from '@ethersproject/abstract-provider'
import { getAddress } from 'ethers/lib/utils'

export const validateAddress = (address: string) => {
  try {
    return getAddress(address)
  } catch (e) {
    return ''
  }
}

export async function isSmartContractAddress(
  address: string,
  provider: Provider
): Promise<boolean> {
  const code = await provider.getCode(address)
  return code !== '0x'
}
