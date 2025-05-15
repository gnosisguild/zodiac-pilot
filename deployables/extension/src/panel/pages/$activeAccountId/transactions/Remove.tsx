import {
  rollbackTransaction,
  useDispatch,
  usePendingTransactions,
} from '@/state'
import { GhostButton } from '@zodiac/ui'
import { Trash2 } from 'lucide-react'

type Props = {
  transactionId: string
}

export const Remove = ({ transactionId }: Props) => {
  const dispatch = useDispatch()
  const pendingTransactions = usePendingTransactions()

  return (
    <GhostButton
      iconOnly
      size="small"
      icon={Trash2}
      disabled={pendingTransactions.length > 0}
      onClick={() => dispatch(rollbackTransaction({ id: transactionId }))}
    >
      Remove transaction
    </GhostButton>
  )
}
