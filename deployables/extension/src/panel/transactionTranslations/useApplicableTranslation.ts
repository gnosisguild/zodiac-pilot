import { useAccount } from '@/accounts'
import {
  translateTransaction,
  useDispatch,
  useTransaction,
} from '@/transactions'
import type { Hex } from '@zodiac/schema'
import { useCallback, useEffect, useState } from 'react'
import { type ChainId, type MetaTransactionRequest } from 'ser-kit'
import {
  type ApplicableTranslation,
  applicableTranslationsCache,
} from './applicableTranslationCache'
import { translations } from './translations'

export const useApplicableTranslation = (transactionId: string) => {
  const transaction = useTransaction(transactionId)
  const dispatch = useDispatch()
  const account = useAccount()

  const [translation, setTranslation] = useState<
    ApplicableTranslation | undefined
  >(undefined)

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
