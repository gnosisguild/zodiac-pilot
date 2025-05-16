export enum ExecutionStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  /** Submitting the transaction failed. This is probably due to an issue in the execution route. */
  FAILED = 'Failed',
  /** Submitting the transaction succeeded, but the Safe meta transaction reverted. */
  META_TRANSACTION_REVERTED = 'Reverted',
  CONFIRMED = 'Confirmed',
}
