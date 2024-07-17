import { useEffect, useState } from 'react'
import { ChainId } from 'ser-kit'

import { useRoute } from '../routes'

import cowswapSetPreSignature from './cowswapSetPreSignature'
import { TransactionTranslation } from './types'
import uniswapMulticall from './uniswapMulticall'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

// ADD ANY NEW TRANSLATIONS TO THIS ARRAY
const translations: TransactionTranslation[] = [
  uniswapMulticall,
  cowswapSetPreSignature,
]

interface ApplicableTranslation {
  /** Title of the applied translation (TransactionTranslation.title) */
  title: string
  /** The translation result (return value of TransactionTranslation.translate) */
  result: MetaTransactionData[]
}

export const useApplicableTranslation = (
  encodedTransaction: MetaTransactionData
) => {
  const [translation, setTranslation] = useState<
    ApplicableTranslation | undefined
  >(undefined)

  const { chainId } = useRoute()

  useEffect(() => {
    findApplicableTranslation(encodedTransaction, chainId).then(setTranslation)
  }, [encodedTransaction, chainId])

  return translation
}

const findApplicableTranslation = async (
  transaction: MetaTransactionData,
  chainId: ChainId
): Promise<ApplicableTranslation | undefined> => {
  // we cache the result of the translation to avoid test-running translation functions over and over again
  const key = cacheKey(transaction, chainId)
  if (applicableTranslationsCache.has(key)) {
    return await applicableTranslationsCache.get(key)
  }

  const tryApplyingTranslations = async () => {
    for (const translation of translations) {
      const result = await translation.translate(transaction, chainId)
      if (result) {
        return {
          title: translation.title,
          result,
        }
        break
      }
    }
  }
  const resultPromise = tryApplyingTranslations()
  applicableTranslationsCache.set(key, resultPromise)

  return await resultPromise
}

const applicableTranslationsCache = new Map<
  string,
  Promise<ApplicableTranslation | undefined>
>()
const cacheKey = (transaction: MetaTransactionData, chainId: ChainId) =>
  `${chainId}:${transaction.to}:${transaction.value}:${transaction.data}:${
    transaction.operation || 0
  }`
