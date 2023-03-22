import React from 'react'
import { BiWrench } from 'react-icons/bi'
import { encodeSingle, TransactionInput } from 'react-multisend'

import { IconButton } from '../../components'
import { ForkProvider } from '../../providers'
import { useConnection } from '../../settings'
import { useApplicableTranslation } from '../../transactionTranslations/useApplicableTranslation'
import { useProvider } from '../ProvideProvider'
import { useDispatch, useNewTransactions } from '../state'

import { formatValue } from './formatValue'
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
  if (!(provider instanceof ForkProvider)) {
    // Transaction translation is only supported when using ForkProvider
    return null
  }
  const encodedTransaction = encodeSingle(transaction)
  const { translation } = useApplicableTranslation(encodedTransaction)

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
      await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            to: tx.to,
            data: tx.data,
            value: formatValue(tx.value),
            from: connection.avatarAddress,
          },
        ],
      })
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
