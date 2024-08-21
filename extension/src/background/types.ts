export interface Fork {
  networkId: number
  rpcUrl: string
}

export interface PilotSession {
  fork: Fork | null
  tabs: Set<number>
}
