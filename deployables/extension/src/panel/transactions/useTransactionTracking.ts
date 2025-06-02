import type { Account } from '@/companion'
import { useGloballyApplicableTranslation } from './translations'
import { useExecutionTracking } from './useExecutionTracking'
import { useForkTracking } from './useForkTracking'
import { useProviderBridge } from './useProviderBridge'
import { useRollbackTracking } from './useRollbackTracking'

export const useTransactionTracking = (account: Account) => {
  useProviderBridge({
    account: account.address,
    chainId: account.chainId,
  })

  useForkTracking()
  useExecutionTracking()
  useRollbackTracking()

  // for now we assume global translations are generally auto-applied, so we don't need to show a button for them
  useGloballyApplicableTranslation()
}
