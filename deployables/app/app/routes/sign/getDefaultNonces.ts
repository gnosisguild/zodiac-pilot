import { ExecutionActionType, prefixAddress, type ExecutionPlan } from 'ser-kit'

export const getDefaultNonces = (plan: ExecutionPlan) => {
  // when planning without setting options, planExecution will populate the default nonces
  const safeTransactions = plan.filter(
    (action) =>
      action.type === ExecutionActionType.SAFE_TRANSACTION ||
      action.type === ExecutionActionType.PROPOSE_TRANSACTION,
  )

  return Object.fromEntries(
    safeTransactions.map(
      (safeTransaction) =>
        [
          prefixAddress(safeTransaction.chain, safeTransaction.safe),
          safeTransaction.safeTransaction.nonce,
        ] as const,
    ),
  )
}
