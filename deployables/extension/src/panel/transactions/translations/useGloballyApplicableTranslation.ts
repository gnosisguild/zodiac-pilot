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
    let canceled = false
    const run = async () => {
      const translation = await findGloballyApplicableTranslation(
        transactions,
        account.chainId,
        account.address,
      )
      if (canceled) {
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
      canceled = true
    }
  }, [transactions, account.chainId, account.address, apply])
}
