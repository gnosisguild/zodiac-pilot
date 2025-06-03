import { useAccount } from '@/accounts'
import {
  findGloballyApplicableTranslation,
  type ApplicableTranslation,
} from '@/translations'
import { useCallback, useEffect } from 'react'
import { useDispatch, useTransactions } from '../TransactionsContext'
import { globalTranslateTransactions } from '../actions'

export const useGloballyApplicableTranslation = () => {
  const transactions = useTransactions()
  const dispatch = useDispatch()
  const account = useAccount()

  const apply = useCallback(
    (translation: ApplicableTranslation) =>
      dispatch(
        globalTranslateTransactions({ translations: translation.result }),
      ),

    [dispatch],
  )

  useEffect(() => {
    const abortController = new AbortController()

    const run = async () => {
      const translation = await findGloballyApplicableTranslation(
        transactions,
        account.chainId,
        account.address,
      )
      if (abortController.signal.aborted) {
        return
      }

      if (translation == null) {
        return
      }

      if (translation.autoApply) {
        apply(translation)
      } else {
        throw new Error('Not implemented')
      }
    }
    run()
    return () => {
      abortController.abort()
    }
  }, [transactions, account.chainId, account.address, apply])
}
