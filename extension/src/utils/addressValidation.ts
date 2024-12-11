import { getAddress, type Provider } from 'ethers'

export const validateAddress = (address: string) => {
  try {
    return getAddress(address)
  } catch (e) {
    return ''
  }
}

export async function isSmartContractAddress(
  address: string,
  provider: Provider,
): Promise<boolean> {
  const code = await provider.getCode(address)
  return code !== '0x'
}
