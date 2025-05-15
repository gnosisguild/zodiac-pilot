import { useAccount } from '@/accounts'
import { useRevertToSnapshot } from '@/providers-ui'
import {
  clearTransactions,
  isConfirmedTransaction,
  type Transaction,
  useDispatch,
  useTransactions,
} from '@/state'
import { type Hex, metaTransactionRequestEqual } from '@zodiac/schema'
import { useCallback, useEffect } from 'react'
import { type ChainId } from 'ser-kit'
import {
  type ApplicableTranslation,
  applicableTranslationsCache,
} from './applicableTranslationCache'
import { translations } from './translations'

export const useGloballyApplicableTranslation = () => {
  const transactions = useTransactions()
  const revertToSnapshot = useRevertToSnapshot()

  const dispatch = useDispatch()
  const account = useAccount()

  const apply = useCallback(
    async (translation: ApplicableTranslation) => {
      const newTransactions = translation.result
      const firstDifferenceIndex = transactions.findIndex(
        (tx, index) => !metaTransactionRequestEqual(tx, newTransactions[index]),
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
        dispatch(
          clearTransactions({ fromId: transactions[firstDifferenceIndex].id }),
        )

        const transaction = transactions[firstDifferenceIndex]

        if (isConfirmedTransaction(transaction)) {
          await revertToSnapshot(transaction)
        }
      }

      // re-simulate all transactions starting at the first difference
      const replayTransaction =
        firstDifferenceIndex === -1
          ? newTransactions.slice(transactions.length)
          : newTransactions.slice(firstDifferenceIndex)
      for (const tx of replayTransaction) {
        // TODO: handle this case!!!
        // sendTransaction(tx)
      }
    },
    [dispatch, revertToSnapshot, transactions],
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
  transactions: Transaction[],
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
        transactions,
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
  transactions: Transaction[],
  chainId: ChainId,
  avatarAddress: Hex,
) => `${chainId}:${avatarAddress}:${transactions.map((tx) => tx.id).join(',')}`
