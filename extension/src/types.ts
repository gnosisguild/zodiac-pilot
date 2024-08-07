import { ChainId, PrefixedAddress, Route as CompleteRoute } from 'ser-kit'
import { SupportedModuleType } from './integrations/zodiac/types'

export enum ProviderType {
  WalletConnect,
  MetaMask,
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

interface PartialRoute {
  id: string
  initiator: PrefixedAddress | undefined
  avatar: PrefixedAddress
  waypoints: CompleteRoute['waypoints'] | undefined
}

export type Route = PartialRoute & {
  providerType: ProviderType
  label: string
  lastUsed?: number
  _migratedFromLegacyConnection?: boolean
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
  to?: string
  value?: number | string
  data?: string
  from?: string
}
