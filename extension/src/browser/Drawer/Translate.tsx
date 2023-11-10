import React from 'react'
import { BiWrench } from 'react-icons/bi'
import { encodeSingle, TransactionInput } from 'react-multisend'

import { IconButton } from '../../components'
import { ForkProvider } from '../../providers'
import { useApplicableTranslation } from '../../transactionTranslations'
import { useProvider } from '../ProvideProvider'
import { useDispatch, useNewTransactions } from '../state'

import classes from './style.module.css'

type Props = {
  transaction: TransactionInput
  index: number
  labeled?: true
}

export const Translate: React.FC<Props> = ({ transaction, index, labeled }) => {
  const provider = useProvider()
  const dispatch = useDispatch()
  const transactions = useNewTransactions()
  const encodedTransaction = encodeSingle(transaction)
  const translation = useApplicableTranslation(encodedTransaction)

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
      .map((t) => encodeSingle(t.input))

    // remove the transaction and all later ones from the store
    dispatch({ type: 'REMOVE_TRANSACTION', payload: { id: transaction.id } })

    // revert to checkpoint before the transaction to remove
    const checkpoint = transaction.id // the ForkProvider uses checkpoints as IDs for the recorded transactions
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
