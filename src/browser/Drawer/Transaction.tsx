import React, { useState } from 'react'
import { TransactionType } from 'react-multisend'

import { Box } from '../../components'
import { TransactionState } from '../state'

import CallContract from './CallContract'
import RawTransaction from './RawTransaction'
import classes from './style.module.css'

interface HeaderProps {
  index: number
  value: TransactionState
  onClick(): void
  onRemove(): void
}

const TransactionHeader: React.FC<HeaderProps> = ({
  index,
  value,
  onClick,
  onRemove,
}) => {
  let title = 'Raw tx'
  if (value.input.type === TransactionType.callContract) {
    title = `Contract call: ${value.input.functionSignature}`
  }

  return (
    <div
      className={classes.transactionHeader}
      onClick={onClick}
      role="button"
      tabIndex={-1}
      onKeyPress={(ev) => {
        if (ev.key === 'Enter') {
          onClick()
        }
      }}
    >
      <div className={classes.titleWrapper}>
        <span className={classes.title}>
          <span className={classes.index}>{index}</span>
          {title}
        </span>
      </div>
      <button
        onClick={onRemove}
        className={classes.removeTransaction}
        title="remove"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.5 13.2128L2.50003 2.21286M2.50003 13.2128L13.5 2.21286"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="square"
          />
        </svg>
      </button>
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
  const [collapsed, setCollapsed] = useState(false)

  const handleRemove = () => {
    // TODO
  }

  return (
    <Box double p={1}>
      <TransactionHeader
        index={index}
        value={value}
        onRemove={handleRemove}
        onClick={() => setCollapsed(!collapsed)}
      />
      {!collapsed && <TransactionBody value={value} />}
    </Box>
  )
}
