import { ChainId } from '../networks'
import { SupportedModuleType } from '../settings/Connection/useZodiacModules'

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
  moduleType?: SupportedModuleType
  roleId?: string
}

export interface JsonRpcRequest {
  method: string
  params?: Array<any>
}

export interface JsonRpcError extends Error {
  data: {
    code: number
    message?: string
    data?: string
  }
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
