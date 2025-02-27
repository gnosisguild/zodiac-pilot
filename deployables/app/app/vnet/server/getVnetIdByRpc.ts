import { getVnetList } from './getVnetList'

export const getVnetIdByRpc = async (
  rpcUrl: string,
): Promise<string | null> => {
  const vnets = await getVnetList()
  for (const vnet of vnets) {
    for (const rpc of vnet.rpcs) {
      if (rpc.url === rpcUrl) {
        return vnet.id
      }
    }
  }
  return null
}
