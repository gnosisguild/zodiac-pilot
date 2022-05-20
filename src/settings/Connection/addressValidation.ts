import { Provider } from '@ethersproject/abstract-provider'
import { getAddress } from '@ethersproject/address'

export function isValidAddress(address: string): boolean {
  try {
    return !!getAddress(address)
  } catch (e) {
    return false
  }
}

export async function isSmartContractAddress(
  address: string,
  provider: Provider
): Promise<boolean> {
  const code = await provider.getCode(address)
  return code !== '0x'
}
