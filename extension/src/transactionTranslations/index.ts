import { useEffect, useState } from 'react'
import { ChainId, parsePrefixedAddress } from 'ser-kit'

import { useRoute } from '../routes'

import cowswapSetPreSignature from './cowswapSetPreSignature'
import { TransactionTranslation } from './types'
import uniswapMulticall from './uniswapMulticall'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import kpkBridgeAware from './karpatkeyInstitutional/kpkBridgeAware'

// ADD ANY NEW TRANSLATIONS TO THIS ARRAY
const translations: TransactionTranslation[] = [
  uniswapMulticall,
  cowswapSetPreSignature,
  kpkBridgeAware,
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

  const { chainId, route } = useRoute()
  const [_, avatarAddress] = parsePrefixedAddress(route.avatar)

  useEffect(() => {
    findApplicableTranslation(encodedTransaction, chainId, avatarAddress).then(
      setTranslation
    )
  }, [encodedTransaction, chainId, avatarAddress])

  return translation
}

const findApplicableTranslation = async (
  transaction: MetaTransactionData,
  chainId: ChainId,
  avatarAddress: `0x${string}`
): Promise<ApplicableTranslation | undefined> => {
  // we cache the result of the translation to avoid test-running translation functions over and over again
  const key = cacheKey(transaction, chainId, avatarAddress)
  if (applicableTranslationsCache.has(key)) {
    return await applicableTranslationsCache.get(key)
  }

  const tryApplyingTranslations = async () => {
    for (const translation of translations) {
      const result = await translation.translate(
        transaction,
        chainId,
        avatarAddress
      )
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
const cacheKey = (
  transaction: MetaTransactionData,
  chainId: ChainId,
  avatarAddress: `0x${string}`
) =>
  `${chainId}:${avatarAddress}:${transaction.to}:${transaction.value}:${transaction.data}:${
    transaction.operation || 0
  }`
