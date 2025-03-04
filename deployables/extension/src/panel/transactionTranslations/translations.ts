import { cowswapSetPreSignature } from './cowswapSetPreSignature'
import { kpkBridgeAware } from './karpatkeyInstitutional/kpkBridgeAware'
import type { TransactionTranslation } from './types'
import { uniswapMulticall } from './uniswapMulticall'
import { gmxSpecific } from './karpatkeyInstitutional/gmxSpecificMulticall.ts'

// ADD ANY NEW TRANSLATIONS TO THIS ARRAY
export const translations: TransactionTranslation[] = [
  uniswapMulticall,
  cowswapSetPreSignature,
  kpkBridgeAware,
  gmxSpecific
]
