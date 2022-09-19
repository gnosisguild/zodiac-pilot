export enum ProviderType {
  WalletConnect,
  MetaMask,
}

export type Connection = {
  id: string
  label: string
  moduleAddress: string
  avatarAddress: string
  pilotAddress: string
  chainId: number | null
  providerType: ProviderType
  roleId: string
}

export interface JsonRpcRequest {
  method: string
  params?: Array<any>
}

export interface Eip1193Provider {
  request(request: JsonRpcRequest): Promise<unknown>
  on(event: string, listener: (...args: any[]) => void): void
  removeListener(event: string, listener: (...args: any[]) => void): void
}