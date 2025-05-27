import { useAccount } from '@/accounts'
import {
  globalTranslateTransactions,
  type Transaction,
  useDispatch,
  useTransactions,
} from '@/transactions'
import { type Hex } from '@zodiac/schema'
import { useCallback, useEffect } from 'react'
import { type ChainId } from 'ser-kit'
import {
  type ApplicableTranslation,
  applicableTranslationsCache,
} from './applicableTranslationCache'
import { translations } from './translations'

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
