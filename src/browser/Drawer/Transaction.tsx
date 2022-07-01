import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import React from 'react'
import { RiArrowDropRightLine, RiDeleteBinLine } from 'react-icons/ri'
import { TransactionInput, TransactionType } from 'react-multisend'

import { Box, Flex, IconButton } from '../../components'
import { TransactionState } from '../state'

import CallContract from './CallContract'
import ContractAddress from './ContractAddress'
import RawTransaction from './RawTransaction'
import RolePermissionCheck from './RolePermissionCheck'
import SimulatedExecutionCheck from './SimulatedExecutionCheck'
import classes from './style.module.css'

interface HeaderProps {
  index: number
  input: TransactionInput
  onRemove(): void
}

const TransactionHeader: React.FC<HeaderProps> = ({
  index,
  input,
  onRemove,
}) => {
  return (
    <div>
      <span className={classes.index}>{index}</span>
      <h5 className={classes.transactionTitle}>
        {input.type === TransactionType.callContract
          ? input.functionSignature.split('(')[0]
          : 'Raw transaction'}
      </h5>

      <Flex gap={2} alignItems="center" className={classes.transactionSubtitle}>
        <EtherValue input={input} />
        <ContractAddress address={input.to} explorerLink />
      </Flex>

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

interface BodyProps {
  input: TransactionInput
}

const TransactionBody: React.FC<BodyProps> = ({ input }) => {
  // const { network, blockExplorerApiKey } = useMultiSendContext()
  switch (input.type) {
    case TransactionType.callContract:
      return <CallContract value={input} />
    // case TransactionType.transferFunds:
    //   return <TransferFunds value={value} onChange={onChange} />
    // case TransactionType.transferCollectible:
    //   return <TransferCollectible value={value} onChange={onChange} />
    case TransactionType.raw:
      return <RawTransaction value={input} />
  }
  return null
}

type Props = TransactionState & {
  index: number
}

export const Transaction: React.FC<Props> = ({
  index,
  transactionHash,
  input,
}) => {
  const handleRemove = () => {
    // TODO
  }

  return (
    <Box p={2} className={classes.container}>
      <TransactionHeader index={index} input={input} onRemove={handleRemove} />
      <TransactionBody input={input} />
      <TransactionStatus input={input} transactionHash={transactionHash} />
    </Box>
  )
}

const TransactionStatus: React.FC<TransactionState> = ({
  input,
  transactionHash,
}) => (
  <dl className={classes.transactionStatus}>
    {transactionHash && (
      <SimulatedExecutionCheck transactionHash={transactionHash} />
    )}

    <RolePermissionCheck transaction={input} />
  </dl>
)

const EtherValue: React.FC<{ input: TransactionInput }> = ({ input }) => {
  let value = ''
  if (
    input.type === TransactionType.callContract ||
    input.type === TransactionType.raw
  ) {
    value = input.value
  }

  if (!value) {
    return null
  }

  const valueBN = BigNumber.from(value)

  if (valueBN.isZero()) {
    return null
  }

  return (
    <>
      <span>{formatEther(valueBN)} ETH</span> <RiArrowDropRightLine />
    </>
  )
}
