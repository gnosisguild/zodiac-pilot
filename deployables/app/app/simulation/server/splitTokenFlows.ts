import type { TokenTransfer } from '@/balances-server'
import type { HexAddress } from '@zodiac/schema'

type TokenFlowSplit = {
  sent: TokenTransfer[]
  received: TokenTransfer[]
  other: TokenTransfer[]
}

export const splitTokenFlows = (flows: TokenTransfer[], address: HexAddress) =>
  flows.reduce<TokenFlowSplit>(
    ({ sent, received, other }, flow) => {
      if (flow.from === address) {
        return {
          sent: [...sent, flow],
          received,
          other,
        }
      }

      if (flow.to === address) {
        return {
          received: [...received, flow],
          sent,
          other,
        }
      }

      return {
        other: [...other, flow],
        sent,
        received,
      }
    },
    { sent: [], received: [], other: [] },
  )
