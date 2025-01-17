export enum RpcMessageType {
  PROBE_CHAIN_ID = 'PROBE_CHAIN_ID',
}

interface ProbeChainId {
  type: RpcMessageType.PROBE_CHAIN_ID
  url: string
}

export type RpcMessage = ProbeChainId
