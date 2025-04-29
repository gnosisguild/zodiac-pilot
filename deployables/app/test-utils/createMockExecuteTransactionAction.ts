import { Chain } from '@zodiac/chains'
import { randomAddress, randomHex } from '@zodiac/test-utils'
import { ExecutionActionType, type ExecutionAction } from 'ser-kit'

type ExecuteTransactionAction = Extract<
  ExecutionAction,
  { type: ExecutionActionType.EXECUTE_TRANSACTION }
>

export const createMockExecuteTransactionAction = (
  action: Partial<Omit<ExecuteTransactionAction, 'type'>>,
): ExecuteTransactionAction => ({
  type: ExecutionActionType.EXECUTE_TRANSACTION,
  chain: Chain.ETH,
  from: randomAddress(),
  transaction: {
    data: randomHex(),
    to: randomAddress(),
    value: 0n,
  },

  ...action,
})
