export enum ExecutionStatus {
  PENDING,
  SUCCESS,
  /** Submitting the transaction failed. This is probably due to an issue in the execution route. */
  FAILED,
  /** Submitting the transaction succeeded, but the Safe meta transaction reverted. */
  META_TRANSACTION_REVERTED,
  CONFIRMED,
}
