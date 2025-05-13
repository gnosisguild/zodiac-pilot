import { useAccount } from '@/accounts'
import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import {
  clearTransactions,
  type TransactionState,
  useDispatch,
  useTransactions,
} from '@/state'
import { invariant } from '@epic-web/invariant'
import type { Hex } from '@zodiac/schema'
import { useCallback, useEffect, useState } from 'react'
import { type ChainId, type MetaTransactionRequest } from 'ser-kit'
import {
  type ApplicableTranslation,
  applicableTranslationsCache,
} from './applicableTranslationCache'
import { translations } from './translations'

export const useApplicableTranslation = (transactionId: string) => {
  const provider = useProvider()
  const transactions = useTransactions()
  const transactionState = getTransaction(transactions, transactionId)
  const metaTransaction = transactionState.transaction

  const dispatch = useDispatch()
  const account = useAccount()

  const [translation, setTranslation] = useState<
    ApplicableTranslation | undefined
  >(undefined)

  const apply = useCallback(
    async (translation: ApplicableTranslation) => {
      const transactionState = getTransaction(transactions, transactionId)
      const index = transactions.indexOf(transactionState)
      const laterTransactions = transactions
        .slice(index + 1)
        .map((txState) => txState.transaction)

      invariant(
        provider instanceof ForkProvider,
        'Transaction translation is only supported when using ForkProvider',
      )

      // remove the transaction and all later ones from the store
      dispatch(clearTransactions({ id: transactionState.id }))

      // revert to checkpoint before the transaction to remove
      const checkpoint = transactionState.snapshotId // the ForkProvider uses checkpoints as IDs for the recorded transactions
      await provider.request({ method: 'evm_revert', params: [checkpoint] })

      // re-simulate all transactions starting with the translated ones
      const replayTransaction = [...translation.result, ...laterTransactions]
      for (const tx of replayTransaction) {
        provider.sendMetaTransaction(tx)
      }
    },
    [transactions, transactionId, provider, dispatch],
  )

  useEffect(() => {
    let canceled = false
    const run = async () => {
      const translation = await findApplicableTranslation(
        metaTransaction,
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
  }, [metaTransaction, account.chainId, account.address, apply])

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

const getTransaction = (
  transactions: TransactionState[],
  transactionId: string,
) => {
  const transaction = transactions.find(({ id }) => id === transactionId)

  invariant(
    transaction != null,
    `Could not find transaction with id "${transactionId}"`,
  )

  return transaction
}
