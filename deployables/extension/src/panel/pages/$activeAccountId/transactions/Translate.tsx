import { ExecutionStatus, useTransaction, useTransactionStatus } from '@/state'
import { useApplicableTranslation } from '@/transaction-translation'
import { SecondaryButton } from '@zodiac/ui'

type Props = {
  transactionId: string
  mini?: boolean
}

export const Translate = ({ transactionId, mini }: Props) => {
  const translation = useApplicableTranslation(transactionId)
  const transaction = useTransaction(transactionId)
  const status = useTransactionStatus(transaction)

  if (!translation) {
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
