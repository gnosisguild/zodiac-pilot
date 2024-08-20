import React from 'react'
import { RiFileCopy2Line } from 'react-icons/ri'
import { toast } from 'react-toastify'

import { IconButton } from '../../components'

import classes from './style.module.css'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

interface Props {
  transaction: MetaTransactionData
  labeled?: boolean
}

const CopyToClipboard: React.FC<Props> = ({ transaction, labeled }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(transaction, undefined, 2))
    toast(<>Transaction data has been copied to clipboard.</>)
  }

  if (labeled) {
    return (
      <button onClick={copyToClipboard} className={classes.link}>
        Copy data
        <RiFileCopy2Line />
      </button>
    )
  } else {
    return (
      <IconButton
        onClick={copyToClipboard}
        title="Copy transaction data to clipboard"
      >
        <RiFileCopy2Line />
      </IconButton>
    )
  }
}

export default CopyToClipboard
