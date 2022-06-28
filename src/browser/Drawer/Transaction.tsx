import React from 'react'
import { RiDeleteBinLine } from 'react-icons/ri'
import { TransactionType } from 'react-multisend'

import { Box, IconButton } from '../../components'
import { TransactionState } from '../state'

import CallContract from './CallContract'
import ContractAddress from './ContractAddress'
import RawTransaction from './RawTransaction'
import classes from './style.module.css'

interface HeaderProps {
  index: number
  value: TransactionState
  onRemove(): void
}

const TransactionHeader: React.FC<HeaderProps> = ({
  index,
  value,
  onRemove,
}) => {
  return (
    <div className={classes.transactionHeader}>
      <ContractAddress address={value.input.to} explorerLink />
      {value.input.type === TransactionType.callContract && (
        <>
          <br />
          {value.input.functionSignature.split('(')[0]}
        </>
      )}

      <IconButton
        onClick={onRemove}
        className={classes.removeTransaction}
        title="remove"
      >
        <RiDeleteBinLine />
      </IconButton>
    </div>
  )
}

interface ContentProps {
  value: TransactionState
}

const TransactionBody: React.FC<ContentProps> = ({ value }) => {
  // const { network, blockExplorerApiKey } = useMultiSendContext()
  switch (value.input.type) {
    case TransactionType.callContract:
      return <CallContract value={value.input} />
    // case TransactionType.transferFunds:
    //   return <TransferFunds value={value} onChange={onChange} />
    // case TransactionType.transferCollectible:
    //   return <TransferCollectible value={value} onChange={onChange} />
    case TransactionType.raw:
      return <RawTransaction value={value.input} />
  }
  return null
}

interface Props {
  index: number
  value: TransactionState
}

export const Transaction: React.FC<Props> = ({ index, value }) => {
  const handleRemove = () => {
    // TODO
  }

  return (
    <Box p={2} className={classes.container}>
      <TransactionHeader index={index} value={value} onRemove={handleRemove} />
      <TransactionBody value={value} />
    </Box>
  )
}
