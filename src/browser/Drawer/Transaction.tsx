import { BigNumber, providers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import React, { useEffect, useRef } from 'react'
import { RiArrowDropRightLine, RiDeleteBinLine } from 'react-icons/ri'
import {
  encodeSingle,
  TransactionInput,
  TransactionType,
} from 'react-multisend'

import { Box, Flex, IconButton } from '../../components'
import { ForkProvider } from '../../providers'
import { useProvider } from '../ProvideProvider'
import { TransactionState, useDispatch, useTransactions } from '../state'

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
  const provider = useProvider()
  const dispatch = useDispatch()
  const allTransactions = useTransactions()
  const elementRef = useRef<HTMLDivElement | null>(null)

  const isLast = index === allTransactions.length - 1

  useEffect(() => {
    if (isLast && elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [isLast])

  const handleRemove = async () => {
    if (!(provider instanceof ForkProvider)) {
      throw new Error('This is only supported when using ForkProvider')
    }

    const laterTransactions = allTransactions.slice(index + 1)

    // remove the transaction and all later ones from the store
    dispatch({ type: 'REMOVE_TRANSACTION', payload: { id: input.id } })

    if (laterTransactions.length === 0) {
      // nothing to rerun, we can delete the fork and will create a fresh one once we receive the next transaction
      await provider.deleteFork()
      return
    }

    // revert to checkpoint before the transaction to remove
    const checkpoint = input.id // the ForkProvider uses checkpoints as IDs for the recorded transactions
    await provider.request({ method: 'evm_revert', params: [checkpoint] })

    // re-simulate all transactions after the removed one
    for (let i = 0; i < laterTransactions.length; i++) {
      const transaction = laterTransactions[i]
      const encoded = encodeSingle(transaction.input)
      await provider.request({
        method: 'eth_sendTransaction',
        params: [{ to: encoded.to, data: encoded.data, value: encoded.value }],
      })
    }
  }

  return (
    <Box ref={elementRef} p={2} className={classes.container}>
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
