import { usePendingTransactions, useRollbackTransaction } from '@/transactions'
import { GhostButton } from '@zodiac/ui'
import { Trash2 } from 'lucide-react'

type Props = {
  transactionId: string
}

export const Remove = ({ transactionId }: Props) => {
  const pendingTransactions = usePendingTransactions()
  const rollbackTransaction = useRollbackTransaction()

  return (
    <GhostButton
      iconOnly
      size="small"
      icon={Trash2}
      disabled={pendingTransactions.length > 0}
      onClick={() => rollbackTransaction(transactionId)}
    >
      Remove transaction
    </GhostButton>
  )
}
