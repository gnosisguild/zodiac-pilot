import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { ExecutionStatus, useTransaction } from '@/state'
import { useApplicableTranslation } from '@/transaction-translation'
import { SecondaryButton } from '@zodiac/ui'

type Props = {
  transactionId: string
  mini?: boolean
}

export const Translate = ({ transactionId, mini }: Props) => {
  const provider = useProvider()
  const translation = useApplicableTranslation(transactionId)
  const transaction = useTransaction(transactionId)

  if (!(provider instanceof ForkProvider)) {
    // Transaction translation is only supported when using ForkProvider
    return null
  }

  if (!translation) {
    return null
  }

  return (
    <SecondaryButton
      fluid
      iconOnly={mini}
      size="small"
      disabled={transaction.status === ExecutionStatus.PENDING}
      icon={translation.icon}
      onClick={translation.apply}
    >
      {translation.title}
    </SecondaryButton>
  )
}
