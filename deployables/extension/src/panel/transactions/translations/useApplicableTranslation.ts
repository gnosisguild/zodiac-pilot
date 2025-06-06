import { useAccount } from '@/accounts'
import type { ApplicableTranslation } from '@/translations'
import { findApplicableTranslation } from '@/translations'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useTransaction } from '../TransactionsContext'
import { translateTransaction } from '../actions'

export const useApplicableTranslation = (transactionId: string) => {
  const transaction = useTransaction(transactionId)
  const dispatch = useDispatch()
  const account = useAccount()

  const [translation, setTranslation] = useState<ApplicableTranslation | null>(
    null,
  )

  const apply = useCallback(
    async (translation: ApplicableTranslation) => {
      dispatch(
        translateTransaction({
          id: transaction.id,
          translations: translation.result,
        }),
      )
    },
    [dispatch, transaction],
  )

  useEffect(() => {
    const abortController = new AbortController()

    const run = async () => {
      const translation = await findApplicableTranslation(
        transaction,
        account.chainId,
        account.address,
      )

      if (abortController.signal.aborted) {
        return
      }

      if (translation == null) {
        setTranslation(null)

        return
      }

      setTranslation(translation)
    }

    run()

    return () => {
      abortController.abort('Effect cancelled')
    }
  }, [account.address, account.chainId, apply, transaction])

  useEffect(() => {
    if (translation == null) {
      return
    }

    if (translation.autoApply == null || translation.autoApply === false) {
      return
    }

    apply(translation)
  }, [apply, translation])

  if (translation == null || translation.autoApply) {
    return
  }

  return {
    title: translation.title,
    result: translation.result,
    icon: translation.icon,
    apply: () => apply(translation),
  }
}
