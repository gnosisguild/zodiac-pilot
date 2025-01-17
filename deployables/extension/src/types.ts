import type { JsonRpcRequest } from '@zodiac/messages'
import type { SupportedZodiacModuleType } from '@zodiac/modules'
import type {
  ExecutionRoute as BaseExecutionRoute,
  HexAddress,
  ProviderType,
} from '@zodiac/schema'
import type { ChainId } from 'ser-kit'

export type { JsonRpcRequest } from '@zodiac/messages'
export { ProviderType } from '@zodiac/schema'
export type { HexAddress } from '@zodiac/schema'

export interface LegacyConnection {
  id: string
  label: string

  moduleAddress: string
  avatarAddress: string
  pilotAddress: string

  chainId: ChainId
  providerType: ProviderType
  moduleType?: SupportedZodiacModuleType

  multisend?: string | undefined
  multisendCallOnly?: string | undefined

  /** A number for Roles v1, a bytes32 hex string for Roles v2  */
  roleId?: string

  lastUsed?: number
}

export type ExecutionRoute = BaseExecutionRoute & {
  lastUsed?: number
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
