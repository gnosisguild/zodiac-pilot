import React from 'react'
import { BiWrench } from 'react-icons/bi'

import { IconButton } from '../../components'
import { ForkProvider } from '../../providers'
import { useApplicableTranslation } from '../../transactionTranslations'
import { useProvider } from '../ProvideProvider'
import { TransactionState, useDispatch, useNewTransactions } from '../../state'

import classes from './style.module.css'

type Props = {
  transactionState: TransactionState
  index: number
  labeled?: true
}

export const Translate: React.FC<Props> = ({
  transactionState,
  index,
  labeled,
}) => {
  const provider = useProvider()
  const dispatch = useDispatch()
  const transactions = useNewTransactions()
  const translation = useApplicableTranslation(transactionState.transaction)

  if (!(provider instanceof ForkProvider)) {
    // Transaction translation is only supported when using ForkProvider
    return null
  }

  if (!translation) {
    return null
  }

  const handleTranslate = async () => {
    const laterTransactions = transactions
      .slice(index + 1)
      .map((txState) => txState.transaction)

    // remove the transaction and all later ones from the store
    dispatch({
      type: 'REMOVE_TRANSACTION',
      payload: { snapshotId: transactionState.snapshotId },
    })

    // revert to checkpoint before the transaction to remove
    const checkpoint = transactionState.snapshotId // the ForkProvider uses checkpoints as IDs for the recorded transactions
    await provider.request({ method: 'evm_revert', params: [checkpoint] })

    // re-simulate all transactions starting with the translated ones
    const replayTransaction = [...translation.result, ...laterTransactions]
    for (const tx of replayTransaction) {
      provider.sendMetaTransaction(tx)
    }
  }

  if (labeled) {
    return (
      <button onClick={handleTranslate} className={classes.link}>
        {translation.title}
        <BiWrench />
      </button>
    )
  } else {
    return (
      <IconButton onClick={handleTranslate} title={translation.title}>
        <BiWrench />
      </IconButton>
    )
  }
}
