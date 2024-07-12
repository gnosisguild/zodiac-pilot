import { MetaTransaction } from 'ethers-multisend'
import { ChainId } from 'ser-kit'
import { SupportedModuleType } from '../integrations/zodiac/types'

export interface TransactionTranslation {
  /** A descriptive title of the translation, will be displayed as a tooltip of the translate button */
  title: string
  /** A list of zodiac modules for which using this translation is recommended */
  recommendedFor: SupportedModuleType[]
  /** The translation function. For transactions that shall not be translated it must return undefined */
  translate: (
    transaction: MetaTransaction,
    chainId: ChainId
  ) => Promise<MetaTransaction[] | undefined>
}
