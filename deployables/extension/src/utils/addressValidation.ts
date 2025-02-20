import { type Provider } from 'ethers'

export async function isSmartContractAddress(
  address: string,
  provider: Provider,
): Promise<boolean> {
  const code = await provider.getCode(address)
  return code !== '0x'
}
