import { cowswapSetPreSignature } from './cowswapSetPreSignature'
import { kpkBridgeAware } from './karpatkeyInstitutional/kpkBridgeAware'
import { TransactionTranslation } from './types'
import { uniswapMulticall } from './uniswapMulticall'

// ADD ANY NEW TRANSLATIONS TO THIS ARRAY
export const translations: TransactionTranslation[] = [
  uniswapMulticall,
  cowswapSetPreSignature,
  kpkBridgeAware,
]
