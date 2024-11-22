import { GhostButton } from '@/components'
import { ForkProvider } from '@/providers'
import { TransactionState, useDispatch, useTransactions } from '@/state'
import { useApplicableTranslation } from '../../transactionTranslations'

import { useProvider } from '@/providers-ui'
import { Wrench } from 'lucide-react'

type Props = {
  transactionState: TransactionState
  index: number
  labeled?: true
}

export const Translate = ({ transactionState, index, labeled }: Props) => {
  const provider = useProvider()
  const dispatch = useDispatch()
  const transactions = useTransactions()
  const translation = useApplicableTranslation(transactionState.transaction)

  if (!(provider instanceof ForkProvider)) {
    // Transaction translation is only supported when using ForkProvider
    return null
  }

  if (!translation) {
    return null
  }

  return (
    <GhostButton
      iconOnly={!labeled}
      icon={Wrench}
      onClick={async () => {
        const laterTransactions = transactions
          .slice(index + 1)
          .map((txState) => txState.transaction)

        // remove the transaction and all later ones from the store
        dispatch({
          type: 'REMOVE_TRANSACTION',
          payload: { id: transactionState.id },
        })

        // revert to checkpoint before the transaction to remove
        const checkpoint = transactionState.snapshotId // the ForkProvider uses checkpoints as IDs for the recorded transactions
        await provider.request({ method: 'evm_revert', params: [checkpoint] })

        // re-simulate all transactions starting with the translated ones
        const replayTransaction = [...translation.result, ...laterTransactions]
        for (const tx of replayTransaction) {
          provider.sendMetaTransaction(tx)
        }
      }}
    >
      {translation.title}
    </GhostButton>
  )
}
