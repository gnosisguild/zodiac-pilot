import { SecondaryButton } from '@zodiac/ui'
import { useTransaction, useTransactionStatus } from '../TransactionsContext'
import { ExecutionStatus } from '../executionStatus'
import { useApplicableTranslation } from './useApplicableTranslation'

type Props = {
  transactionId: string
  mini?: boolean
}

export const Translate = ({ transactionId, mini }: Props) => {
  const translation = useApplicableTranslation(transactionId)
  const transaction = useTransaction(transactionId)
  const status = useTransactionStatus(transaction)

  if (translation == null) {
    return null
  }

  return (
    <SecondaryButton
      fluid
      iconOnly={mini}
      size="small"
      disabled={status === ExecutionStatus.PENDING}
      icon={translation.icon}
      onClick={translation.apply}
    >
      {translation.title}
    </SecondaryButton>
  )
}
