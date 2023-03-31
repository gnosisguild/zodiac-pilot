import React from 'react'
import { BiWrench } from 'react-icons/bi'
import {
  encodeSingle,
  MetaTransaction,
  TransactionInput,
} from 'react-multisend'

import { IconButton } from '../../components'
import { ForkProvider } from '../../providers'
import { useConnection } from '../../settings'
import { useApplicableTranslation } from '../../transactionTranslations/useApplicableTranslation'
import { Connection } from '../../types'
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
  const { connection } = useConnection()
  const encodedTransaction = encodeSingle(transaction)
  const { translation } = useApplicableTranslation(encodedTransaction)

  if (!(provider instanceof ForkProvider)) {
    // Transaction translation is only supported when using ForkProvider
    return null
  }

  if (!translation) {
    return null
  }

  const handleTranslate = async () => {
    const translatedTransactions = await translation.translate(
      encodedTransaction
    )
    if (!translatedTransactions) {
      throw new Error('Translation failed')
    }

    const laterTransactions = transactions
      .slice(index + 1)
      .map((t) => encodeSingle(t.input))

    // remove the transaction and all later ones from the store
    dispatch({ type: 'REMOVE_TRANSACTION', payload: { id: transaction.id } })

    // revert to checkpoint before the transaction to remove
    const checkpoint = transaction.id // the ForkProvider uses checkpoints as IDs for the recorded transactions
    await provider.request({ method: 'evm_revert', params: [checkpoint] })

    // re-simulate all transactions starting with the translated ones
    const replayTransaction = [...translatedTransactions, ...laterTransactions]
    for (const tx of replayTransaction) {
      provider.sendMetaTransaction(tx, connection)
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

const simulateDelegateCall = async (
  tx: MetaTransaction,
  connection: Connection
) => {
  if (tx.operation !== 1) throw new Error('not a delegatecall')

  if (!connection.moduleAddress) {
    console.warn(
      'Cannot simulate delegatecall since the connection does not use a module'
    )
    return tx
  }
}
