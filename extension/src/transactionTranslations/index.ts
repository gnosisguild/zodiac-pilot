import { MetaTransaction } from 'react-multisend'

import { TransactionTranslation } from './types'
import uniswapMulticall from './uniswapMulticall'
import cowswapSetPreSignature from './cowswapSetPreSignature'

const translations = [uniswapMulticall, cowswapSetPreSignature]

export const findApplicableTranslation = async (
  transaction: MetaTransaction
): Promise<TransactionTranslation | undefined> => {
  for (const translation of translations) {
    if (await translation.translate(transaction)) return translation
  }
  return undefined
}
