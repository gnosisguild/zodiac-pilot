import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import {
  RiArrowDropRightLine,
  RiCheckboxCircleLine,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiExternalLinkLine,
} from 'react-icons/ri'
import { TransactionInput, TransactionType } from 'react-multisend'

import { Box, Flex, IconButton, Spinner, Tag } from '../../components'
import { useTenderlyProvider } from '../../providers'
import { TenderlyTransactionInfo } from '../../providers/ProvideTenderly'
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
    <div>
      <span className={classes.index}>{index}</span>
      <h5 className={classes.transactionTitle}>
        {value.input.type === TransactionType.callContract
          ? value.input.functionSignature.split('(')[0]
          : 'Raw transaction'}
      </h5>

      <Flex gap={2} alignItems="center" className={classes.transactionSubtitle}>
        <EtherValue input={value.input} />
        <ContractAddress address={value.input.to} explorerLink />
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
  value: TransactionState
}

const TransactionBody: React.FC<BodyProps> = ({ value }) => {
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
  hash: string
  value: TransactionState
}

export const Transaction: React.FC<Props> = ({ index, hash, value }) => {
  const handleRemove = () => {
    // TODO
  }

  return (
    <Box p={2} className={classes.container}>
      <TransactionHeader index={index} value={value} onRemove={handleRemove} />
      <TransactionBody value={value} />
      <TransactionStatus hash={hash} />
    </Box>
  )
}

const TransactionStatus: React.FC<{ hash: string }> = ({ hash }) => {
  const tenderlyProvider = useTenderlyProvider()

  const [transactionInfo, setTransactionInfo] =
    useState<TenderlyTransactionInfo | null>(null)

  useEffect(() => {
    let canceled = false

    const transactionInfoPromise = tenderlyProvider.getTransactionInfo(hash)
    transactionInfoPromise.then((txInfo) => {
      if (!canceled) setTransactionInfo(txInfo)
    })

    return () => {
      canceled = true
    }
  }, [tenderlyProvider, hash])

  return (
    <dl className={classes.transactionStatus}>
      <dt>Status</dt>
      <dd>
        {!transactionInfo && (
          <Tag head={<Spinner />} color="info">
            Pending...
          </Tag>
        )}
        {transactionInfo?.status && (
          <Tag head={<RiCheckboxCircleLine />} color="success">
            Success
          </Tag>
        )}
        {transactionInfo && !transactionInfo.status && (
          <Tag head={<RiErrorWarningLine />} color="danger">
            Reverted
          </Tag>
        )}
      </dd>

      {transactionInfo && (
        <a
          href={transactionInfo.dashboardLink}
          target="_blank"
          rel="noreferrer"
          className={classes.link}
        >
          View in Tenderly
          <RiExternalLinkLine />
        </a>
      )}
    </dl>
  )
}

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
