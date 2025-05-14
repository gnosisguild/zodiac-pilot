import {
  ExecutionStatus,
  rollbackTransaction,
  useDispatch,
  useTransaction,
  useTransactionStatus,
} from '@/state'
import { GhostButton } from '@zodiac/ui'
import { Trash2 } from 'lucide-react'

type Props = {
  transactionId: string
}

export const Remove = ({ transactionId }: Props) => {
  const dispatch = useDispatch()
  const transaction = useTransaction(transactionId)
  const status = useTransactionStatus(transaction)

  return (
    <GhostButton
      iconOnly
      size="small"
      icon={Trash2}
      disabled={
        status !== ExecutionStatus.SUCCESS && status !== ExecutionStatus.FAILED
      }
      onClick={() => {
        dispatch(rollbackTransaction({ id: transactionId }))
      }}
    >
      Remove transaction
    </GhostButton>
  )
}
