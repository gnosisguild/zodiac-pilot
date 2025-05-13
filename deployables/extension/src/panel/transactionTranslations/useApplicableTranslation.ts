import { useAccount } from '@/accounts'
import { useRevertToSnapshot, useSendTransaction } from '@/providers-ui'
import {
  clearTransactions,
  isConfirmedTransaction,
  useDispatch,
  useTransaction,
  useTransactions,
} from '@/state'
import type { Hex } from '@zodiac/schema'
import { useCallback, useEffect, useState } from 'react'
import { type ChainId, type MetaTransactionRequest } from 'ser-kit'
import {
  type ApplicableTranslation,
  applicableTranslationsCache,
} from './applicableTranslationCache'
import { translations } from './translations'

export const useApplicableTranslation = (transactionId: string) => {
  const transactions = useTransactions()
  const transaction = useTransaction(transactionId)
  const sendTransaction = useSendTransaction()
  const revertToSnapshot = useRevertToSnapshot()

  const dispatch = useDispatch()
  const account = useAccount()

  const [translation, setTranslation] = useState<
    ApplicableTranslation | undefined
  >(undefined)

  const apply = useCallback(
    async (translation: ApplicableTranslation) => {
      const index = transactions.indexOf(transaction)
      const laterTransactions = transactions.slice(index + 1)

      // remove the transaction and all later ones from the store
      dispatch(clearTransactions({ fromId: transaction.id }))

      if (isConfirmedTransaction(transaction)) {
        await revertToSnapshot(transaction)
      }

      // re-simulate all transactions starting with the translated ones
      const replayTransaction = [...translation.result, ...laterTransactions]
      for (const tx of replayTransaction) {
        sendTransaction(tx)
      }
    },
    [dispatch, revertToSnapshot, sendTransaction, transaction, transactions],
  )

  useEffect(() => {
    let canceled = false
    const run = async () => {
      const translation = await findApplicableTranslation(
        transaction,
        account.chainId,
        account.address,
      )
      if (canceled) return

      if (translation?.autoApply) {
        apply(translation)
      } else {
        setTranslation(translation)
      }
    }
    run()
    return () => {
      canceled = true
    }
  }, [account.address, account.chainId, apply, transaction])

  return translation && !translation.autoApply
    ? {
        title: translation.title,
        result: translation.result,
        icon: translation.icon,
        apply: () => apply(translation),
      }
    : undefined
}

const findApplicableTranslation = async (
  metaTransaction: MetaTransactionRequest,
  chainId: ChainId,
  avatarAddress: Hex,
): Promise<ApplicableTranslation | undefined> => {
  // we cache the result of the translation to avoid test-running translation functions over and over again
  const key = cacheKey(metaTransaction, chainId, avatarAddress)
  if (applicableTranslationsCache.has(key)) {
    return await applicableTranslationsCache.get(key)
  }

  const tryApplyingTranslations = async () => {
    for (const translation of translations) {
      if (!('translate' in translation)) {
        continue
      }

      const result = await translation.translate(
        metaTransaction,
        chainId,
        avatarAddress,
      )
      if (result) {
        return {
          title: translation.title,
          autoApply: translation.autoApply,
          icon: translation.icon,
          result,
        }
      }
    }
  }
  const resultPromise = tryApplyingTranslations()
  applicableTranslationsCache.set(key, resultPromise)

  return await resultPromise
}

const cacheKey = (
  transaction: MetaTransactionRequest,
  chainId: ChainId,
  avatarAddress: Hex,
) =>
  `${chainId}:${avatarAddress}:${transaction.to}:${transaction.value}:${transaction.data}:${
    transaction.operation || 0
  }`
