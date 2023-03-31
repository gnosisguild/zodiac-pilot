import { useEffect, useState } from 'react'
import { MetaTransaction } from 'react-multisend'

import { ChainId } from '../networks'
import { useConnection } from '../settings'

import cowswapSetPreSignature from './cowswapSetPreSignature'
import { TransactionTranslation } from './types'
import uniswapMulticall from './uniswapMulticall'

// ADD ANY NEW TRANSLATIONS TO THIS ARRAY
const translations: TransactionTranslation[] = [
  uniswapMulticall,
  cowswapSetPreSignature,
]

interface ApplicableTranslation {
  /** Title of the applied translation (TransactionTranslation.title) */
  title: string
  /** The translation result (return value of TransactionTranslation.translate) */
  result: MetaTransaction[]
}

export const useApplicableTranslation = (
  encodedTransaction: MetaTransaction
) => {
  const [translation, setTranslation] = useState<
    ApplicableTranslation | undefined
  >(undefined)

  const {
    connection: { chainId },
  } = useConnection()

  useEffect(() => {
    findApplicableTranslation(encodedTransaction, chainId).then(setTranslation)
  }, [encodedTransaction, chainId])

  return translation
}

const findApplicableTranslation = async (
  transaction: MetaTransaction,
  chainId: ChainId
): Promise<ApplicableTranslation | undefined> => {
  // we cache the result of the translation to avoid test-running translation functions over and over again
  const key = cacheKey(transaction, chainId)
  if (applicableTranslationsCache.has(key)) {
    return applicableTranslationsCache.get(key)
  }

  let applicableTranslation: ApplicableTranslation | undefined = undefined
  for (const translation of translations) {
    const result = await translation.translate(transaction, chainId)
    if (result) {
      applicableTranslation = {
        title: translation.title,
        result,
      }
      break
    }
  }

  applicableTranslationsCache.set(key, applicableTranslation)

  return applicableTranslation
}

const applicableTranslationsCache = new Map<
  string,
  ApplicableTranslation | undefined
>()
const cacheKey = (transaction: MetaTransaction, chainId: ChainId) =>
  `${chainId}:${transaction.to}:${transaction.value}:${transaction.data}:${
    transaction.operation || 0
  }`
