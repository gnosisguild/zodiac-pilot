import { useDecodeTransactions } from './useDecodeTransactions'
import { useExecutionTracking } from './useExecutionTracking'
import { useForkTracking } from './useForkTracking'
import { useRollbackTracking } from './useRollbackTracking'

export const useTransactionTracking = () => {
  useForkTracking()
  useExecutionTracking()
  useRollbackTracking()
  useDecodeTransactions()
}
