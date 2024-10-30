import { IconButton } from '@/components'
import { ForkProvider, useProvider } from '@/providers'
import { TransactionState } from '@/state'
import React from 'react'
import { BiWrench } from 'react-icons/bi'
import { useApplicableTranslation } from '../../transactionTranslations'
import classes from './style.module.css'

type Props = {
  transactionState: TransactionState
  index: number
  labeled?: true
}

export const Translate: React.FC<Props> = ({ index, labeled }) => {
  const provider = useProvider()
  const translation = useApplicableTranslation(index)

  if (!(provider instanceof ForkProvider)) {
    // Transaction translation is only supported when using ForkProvider
    return null
  }

  if (!translation) {
    return null
  }

  if (labeled) {
    return (
      <button onClick={translation.apply} className={classes.link}>
        {translation.title}
        <BiWrench />
      </button>
    )
  } else {
    return (
      <IconButton onClick={translation.apply} title={translation.title}>
        <BiWrench />
      </IconButton>
    )
  }
}