import { ChainId } from '../networks'

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
  chainId: ChainId
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

export interface TransactionData {
  to?: string
  value?: number | string
  data?: string
  from?: string
}
