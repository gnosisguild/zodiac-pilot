import { MetaTransaction } from 'react-multisend'

import cowswapSetPreSignature from './cowswapSetPreSignature'
import { TransactionTranslation } from './types'
import uniswapMulticall from './uniswapMulticall'

const translations = [uniswapMulticall, cowswapSetPreSignature]

export const findApplicableTranslation = async (
  transaction: MetaTransaction
): Promise<TransactionTranslation | undefined> => {
  for (const translation of translations) {
    if (await translation.translate(transaction)) return translation
  }
  return undefined
}
