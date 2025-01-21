import type { JsonRpcProvider } from 'ethers'

export async function isSmartContractAddress(
  address: string,
  provider: JsonRpcProvider,
): Promise<boolean> {
  const code = await provider.getCode(address)
  return code !== '0x'
}
