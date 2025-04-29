import { Chain } from '@zodiac/chains'
import { OperationType } from '@zodiac/schema'
import { randomAddress, randomHex } from '@zodiac/test-utils'
import { ExecutionActionType, type ExecutionAction } from 'ser-kit'

type PropposeTransactionAction = Extract<
  ExecutionAction,
  { type: ExecutionActionType.PROPOSE_TRANSACTION }
>

export const createMockProposeTransactionAction = (
  action: Partial<Omit<PropposeTransactionAction, 'type'>> = {},
): PropposeTransactionAction => ({
  type: ExecutionActionType.PROPOSE_TRANSACTION,

  chain: Chain.ETH,
  proposer: randomAddress(),
  safe: randomAddress(),
  safeTransaction: {
    baseGas: 0n,
    data: randomHex(),
    gasPrice: 0n,
    gasToken: randomAddress(),
    nonce: 0,
    operation: OperationType.Call,
    refundReceiver: randomAddress(),
    safeTxGas: 0n,
    to: randomAddress(),
    value: 0n,
  },
  signature: randomHex(),

  ...action,
})
