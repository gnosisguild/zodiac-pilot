import { MetaTransaction } from 'react-multisend'

import { TransactionTranslation } from './types'
import uniswapMulticall from './uniswapMulticall'

const translations = [uniswapMulticall]

export const findApplicableTranslation = (
  transaction: MetaTransaction
): TransactionTranslation | undefined => {
  for (const translation of translations) {
    try {
      if (translation.translate(transaction)) return translation
    } catch (e) {
      continue
    }
  }
  return undefined
}
