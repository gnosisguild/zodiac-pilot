import { useEffect, useState } from 'react'
import { MetaTransaction } from 'react-multisend'

import { ChainId } from '../networks'
import { useConnection } from '../settings'

import cowswapSetPreSignature from './cowswapSetPreSignature'
import { TransactionTranslation } from './types'
import uniswapMulticall from './uniswapMulticall'

// ADD ANY NEW TRANSLATIONS TO THIS ARRAY
const translations = [uniswapMulticall, cowswapSetPreSignature]

const findApplicableTranslation = async (
  transaction: MetaTransaction,
  chainId: ChainId
): Promise<TransactionTranslation | undefined> => {
  for (const translation of translations) {
    if (await translation.translate(transaction, chainId)) return translation
  }
  return undefined
}

export const useApplicableTranslation = (
  encodedTransaction: MetaTransaction
) => {
  const [translation, setTranslation] = useState<
    TransactionTranslation | undefined
  >(undefined)

  const {
    connection: { chainId },
  } = useConnection()

  useEffect(() => {
    findApplicableTranslation(encodedTransaction, chainId).then(setTranslation)
  }, [encodedTransaction, chainId])

  return translation
}
