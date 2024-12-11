import type { LucideIcon } from 'lucide-react'
import type { MetaTransactionRequest } from 'ser-kit'

export interface ApplicableTranslation {
  /** Title of the applied translation (TransactionTranslation.title) */
  title: string
  /** If true, the translation will be applied automatically. By default translations will be suggested to the user who then applies them by clicking a button **/
  autoApply?: boolean
  icon: LucideIcon
  /** The translation result (return value of TransactionTranslation.translate) */
  result: MetaTransactionRequest[]
}

export const applicableTranslationsCache = new Map<
  string,
  Promise<ApplicableTranslation | undefined>
>()
