import type { ChainId, Route as CompleteRoute } from 'ser-kit'
import type { SupportedModuleType } from './panel/integrations/zodiac/types'

export enum ProviderType {
  WalletConnect,
  InjectedWallet,
}

export interface LegacyConnection {
  id: string
  label: string

  moduleAddress: string
  avatarAddress: string
  pilotAddress: string

  chainId: ChainId
  providerType: ProviderType
  moduleType?: SupportedModuleType

  multisend?: string | undefined
  multisendCallOnly?: string | undefined

  /** A number for Roles v1, a bytes32 hex string for Roles v2  */
  roleId?: string

  lastUsed?: number
}

interface PartialExecutionRoute {
  id: string
  initiator?: CompleteRoute['initiator']
  avatar: CompleteRoute['avatar']
  waypoints?: CompleteRoute['waypoints']
}

export type ExecutionRoute = PartialExecutionRoute & {
  providerType: ProviderType
  label: string
  lastUsed?: number
}

export interface JsonRpcRequest {
  method: string
  params?: readonly unknown[] | object
}

export interface JsonRpcError extends Error {
  data: {
    code: number
    message?: string
    data?: string
    originalError?: JsonRpcError['data']
  }
}

export interface Eip1193Provider {
  request(request: JsonRpcRequest): Promise<unknown>
  on(event: string, listener: (...args: any[]) => void): void
  removeListener(event: string, listener: (...args: any[]) => void): void
}

export interface TransactionData {
  to?: HexAddress
  value?: string
  data?: HexAddress
  from?: HexAddress
}

export type HexAddress = `0x${string}`
