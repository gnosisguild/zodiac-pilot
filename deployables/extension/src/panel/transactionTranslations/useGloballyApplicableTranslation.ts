import { useAccount } from '@/accounts'
import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { type TransactionState, useDispatch, useTransactions } from '@/state'
import type { Hex } from '@zodiac/schema'
import { useCallback, useEffect } from 'react'
import { type ChainId, type MetaTransactionRequest } from 'ser-kit'
import {
  type ApplicableTranslation,
  applicableTranslationsCache,
} from './applicableTranslationCache'
import { translations } from './translations'

export const useGloballyApplicableTranslation = () => {
  const provider = useProvider()
  const transactions = useTransactions()

  const dispatch = useDispatch()
  const account = useAccount()

  const apply = useCallback(
    async (translation: ApplicableTranslation) => {
      if (!(provider instanceof ForkProvider)) {
        throw new Error(
          'Transaction translation is only supported when using ForkProvider',
        )
      }

      const newTransactions = translation.result
      const firstDifferenceIndex = transactions.findIndex(
        (tx, index) =>
          !transactionsEqual(tx.transaction, newTransactions[index]),
      )

      if (
        firstDifferenceIndex === -1 &&
        newTransactions.length === transactions.length
      ) {
        console.warn(
          'Global translations returned the original set of transactions. It should return undefined in that case.',
        )
        return
      }

      if (firstDifferenceIndex !== -1) {
        // remove all transactions from the store starting at the first difference
        dispatch({
          type: 'CLEAR_TRANSACTIONS',
          payload: { id: transactions[firstDifferenceIndex].id },
        })

        // revert to checkpoint before first difference
        const checkpoint = transactions[firstDifferenceIndex].snapshotId // the ForkProvider uses checkpoints as IDs for the recorded transactions
        await provider.request({ method: 'evm_revert', params: [checkpoint] })
      }

      // re-simulate all transactions starting at the first difference
      const replayTransaction =
        firstDifferenceIndex === -1
          ? newTransactions.slice(transactions.length)
          : newTransactions.slice(firstDifferenceIndex)
      for (const tx of replayTransaction) {
        provider.sendMetaTransaction(tx)
      }
    },
    [provider, dispatch, transactions],
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

const findGloballyApplicableTranslation = async (
  transactions: TransactionState[],
  chainId: ChainId,
  avatarAddress: Hex,
): Promise<ApplicableTranslation | undefined> => {
  if (transactions.length === 0) return undefined

  // we cache the result of the translation to avoid test-running translation functions over and over again
  const key = cacheKeyGlobal(transactions, chainId, avatarAddress)
  if (applicableTranslationsCache.has(key)) {
    return await applicableTranslationsCache.get(key)
  }

  const tryApplyingTranslations = async () => {
    for (const translation of translations) {
      if (!('translateGlobal' in translation)) {
        continue
      }

      const result = await translation.translateGlobal(
        transactions.map((txState) => txState.transaction),
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

const cacheKeyGlobal = (
  transactions: TransactionState[],
  chainId: ChainId,
  avatarAddress: Hex,
) => `${chainId}:${avatarAddress}:${transactions.map((tx) => tx.id).join(',')}`

const transactionsEqual = (
  a: MetaTransactionRequest,
  b: MetaTransactionRequest,
) =>
  a.to.toLowerCase() === b.to.toLowerCase() &&
  (a.value || 0n === b.value || 0n) &&
  a.data === b.data &&
  (a.operation || 0 === b.operation || 0)
