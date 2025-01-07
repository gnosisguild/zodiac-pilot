import type { ChainId } from 'ser-kit'

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'

export type ConnectResult = { chainId: ChainId; accounts: string[] }

export type ConnectFn = (options?: {
  force?: boolean
}) => Promise<ConnectResult | undefined>

export type ConnectionProvider = {
  ready: boolean
  accounts: string[]
  chainId: ChainId | null
  connect: ConnectFn
  connectionStatus: ConnectionStatus
}
