import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import type { LucideIcon } from 'lucide-react'

export interface ApplicableTranslation {
  /** Title of the applied translation (TransactionTranslation.title) */
  title: string
  /** If true, the translation will be applied automatically. By default translations will be suggested to the user who then applies them by clicking a button **/
  autoApply?: boolean
  icon: LucideIcon
  /** The translation result (return value of TransactionTranslation.translate) */
  result: MetaTransactionData[]
}

export const applicableTranslationsCache = new Map<
  string,
  Promise<ApplicableTranslation | undefined>
>()
