import { MetaTransaction } from 'react-multisend'

import { SupportedModuleType } from '../settings/Connection/useZodiacModules'

export interface TransactionTranslation {
  name: string
  description: string
  recommendedFor: SupportedModuleType[]
  translation: (request: MetaTransaction) => MetaTransaction[]
}
