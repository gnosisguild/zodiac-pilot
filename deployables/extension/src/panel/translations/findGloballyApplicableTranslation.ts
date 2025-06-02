import type { ChainId } from '@zodiac/chains'
import type { Hex, MetaTransactionRequest } from '@zodiac/schema'
import {
  applicableTranslationsCache,
  type ApplicableTranslation,
} from './applicableTranslationCache'
import { cacheKey } from './findApplicableTranslation'
import { translations } from './translations'

export const findGloballyApplicableTranslation = async (
  transactions: MetaTransactionRequest[],
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
  transactions: MetaTransactionRequest[],
  chainId: ChainId,
  avatarAddress: Hex,
) => transactions.map((tx) => cacheKey(tx, chainId, avatarAddress)).join(',')
