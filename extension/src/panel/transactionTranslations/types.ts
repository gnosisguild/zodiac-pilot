import type { LucideIcon } from 'lucide-react'
import type { ChainId, MetaTransactionRequest } from 'ser-kit'
import type { SupportedModuleType } from '../integrations/zodiac/types'

export type TransactionTranslation = {
  /** A descriptive title of the translation, will be displayed as a tooltip of the translate button */
  title: string
  /** If true, the translation will be applied automatically. By default translations will be suggested to the user who then applies them by clicking a button */
  autoApply?: boolean
  icon: LucideIcon
  /** A list of zodiac modules for which using this translation is recommended */
  recommendedFor: SupportedModuleType[]
} & (
  | {
      /** The translation function. For transactions that shall not be translated it must return undefined */
      translate: (
        transaction: MetaTransactionRequest,
        chainId: ChainId,
        avatarAddress: `0x${string}`,
      ) => Promise<MetaTransactionRequest[] | undefined>
    }
  | {
      /** The translation function. For transactions that shall not be translated it must return undefined */
      translateGlobal: (
        allTransactions: MetaTransactionRequest[],
        chainId: ChainId,
        avatarAddress: `0x${string}`,
      ) => Promise<MetaTransactionRequest[] | undefined>
    }
)
