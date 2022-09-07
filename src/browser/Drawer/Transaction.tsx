import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { RiArrowDropRightLine, RiDeleteBinLine } from 'react-icons/ri'
import {
  encodeSingle,
  TransactionInput,
  TransactionType,
} from 'react-multisend'

import { Box, Flex, IconButton } from '../../components'
import ToggleButton from '../../components/Drawer/ToggleButton'
import { ChainId, NETWORK_CURRENCY } from '../../networks'
import { ForkProvider } from '../../providers'
import { useConnection } from '../../settings'
import { useProvider } from '../ProvideProvider'
import { TransactionState, useDispatch, useNewTransactions } from '../state'

import CallContract from './CallContract'
import ContractAddress from './ContractAddress'
import RawTransaction from './RawTransaction'
import RolePermissionCheck from './RolePermissionCheck'
import SimulatedExecutionCheck from './SimulatedExecutionCheck'
import classes from './style.module.css'

interface HeaderProps {
  index: number
  input: TransactionInput
  transactionHash: TransactionState['transactionHash']
  onRemove(): void
  onExpandToggle(): void
  expanded: boolean
}

const TransactionHeader: React.FC<HeaderProps> = ({
  index,
  input,
  transactionHash,
  onRemove,
  onExpandToggle,
  expanded,
}) => {
  return (
    <div className={classes.transactionHeader}>
      <label className={classes.start}>
        <div className={classes.index}>{index + 1}</div>
        <div className={classes.toggle}>
          <ToggleButton expanded={expanded} onToggle={onExpandToggle} />
        </div>
        <h5 className={classes.transactionTitle}>
          {input.type === TransactionType.callContract
            ? input.functionSignature.split('(')[0]
            : 'Raw transaction'}
        </h5>
      </label>
      <div className={classes.end}>
        {transactionHash && (
          <SimulatedExecutionCheck transactionHash={transactionHash} mini />
        )}

        <RolePermissionCheck transaction={input} mini />
        <IconButton
          onClick={onRemove}
          className={classes.removeTransaction}
          title="remove"
        >
          <RiDeleteBinLine />
        </IconButton>
      </div>
    </div>
  )
}

interface BodyProps {
  input: TransactionInput
}

const TransactionBody: React.FC<BodyProps> = ({ input }) => {
  // const { network, blockExplorerApiKey } = useMultiSendContext()
  let txInfo: ReactNode = <></>
  switch (input.type) {
    case TransactionType.callContract:
      txInfo = <CallContract value={input} />
      break
    // case TransactionType.transferFunds:
    //   return <TransferFunds value={value} onChange={onChange} />
    // case TransactionType.transferCollectible:
    //   return <TransferCollectible value={value} onChange={onChange} />
    case TransactionType.raw:
      txInfo = <RawTransaction value={input} />
      break
  }
  return (
    <Box p={2} bg className={classes.transactionContainer}>
      {txInfo}
    </Box>
  )
}

type Props = TransactionState & {
  index: number
  scrollIntoView: boolean
}

export const Transaction: React.FC<Props> = ({
  index,
  transactionHash,
  input,
  scrollIntoView,
}) => {
  const [expanded, setExpanded] = useState(true)
  const provider = useProvider()
  const dispatch = useDispatch()
  const transactions = useNewTransactions()
  const {
    connection: { avatarAddress },
  } = useConnection()
  const elementRef = useScrollIntoView(scrollIntoView)

  const handleRemove = async () => {
    if (!(provider instanceof ForkProvider)) {
      throw new Error('This is only supported when using ForkProvider')
    }

    const laterTransactions = transactions.slice(index + 1)

    // remove the transaction and all later ones from the store
    dispatch({ type: 'REMOVE_TRANSACTION', payload: { id: input.id } })

    if (transactions.length === 1) {
      // no more recorded transaction remains: we can delete the fork and will create a fresh one once we receive the next transaction
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
        params: [
          {
            to: encoded.to,
            data: encoded.data,
            value: formatValue(encoded.value),
            from: avatarAddress,
          },
        ],
      })
    }
  }

  return (
    <Box ref={elementRef} p={2} className={classes.container}>
      <TransactionHeader
        index={index}
        input={input}
        transactionHash={transactionHash}
        onRemove={handleRemove}
        expanded={expanded}
        onExpandToggle={() => setExpanded(!expanded)}
      />
      {expanded && (
        <>
          <Box bg p={2} className={classes.subtitleContainer}>
            <Flex
              gap={2}
              alignItems="center"
              justifyContent="space-between"
              className={classes.transactionSubtitle}
            >
              <ContractAddress address={input.to} explorerLink />
              <EtherValue input={input} />
            </Flex>
          </Box>
          <TransactionStatus input={input} transactionHash={transactionHash} />
          <TransactionBody input={input} />
        </>
      )}
    </Box>
  )
}

export const TransactionBadge: React.FC<Props> = ({
  index,
  transactionHash,
  input,
  scrollIntoView,
}) => {
  const elementRef = useScrollIntoView(scrollIntoView)

  return (
    <Box
      ref={elementRef}
      p={2}
      className={classes.badgeContainer}
      double
      rounded
    >
      <div className={classes.txNumber}>{index + 1}</div>
      {transactionHash && (
        <SimulatedExecutionCheck transactionHash={transactionHash} mini />
      )}

      <RolePermissionCheck transaction={input} mini />
    </Box>
  )
}

const TransactionStatus: React.FC<TransactionState> = ({
  input,
  transactionHash,
}) => (
  <Flex
    gap={1}
    justifyContent="space-between"
    className={classes.transactionStatus}
  >
    {transactionHash && (
      <Box bg p={2} className={classes.statusHeader}>
        <SimulatedExecutionCheck transactionHash={transactionHash} />
      </Box>
    )}
    <Box bg p={2} className={classes.statusHeader}>
      <RolePermissionCheck transaction={input} />
    </Box>
  </Flex>
)

const EtherValue: React.FC<{ input: TransactionInput }> = ({ input }) => {
  const { provider } = useConnection()
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

  return (
    <Box p={2} className={classes.value}>
      <Flex gap={1} alignItems="center" justifyContent="space-between">
        <div>Value:</div>
        <Box p={1} bg>
          {valueBN.isZero()
            ? 'n/a'
            : `${formatEther(valueBN)} ${
                NETWORK_CURRENCY[provider.chainId as ChainId]
              }`}
        </Box>
      </Flex>
    </Box>
  )
}

// Tenderly has particular repquirements for the encoding of value: it must not have any leading zeros
const formatValue = (value: string): string => {
  const valueBN = BigNumber.from(value)
  if (valueBN.isZero()) return '0x0'
  else return valueBN.toHexString().replace(/^0x(0+)/, '0x')
}

const useScrollIntoView = (enable: boolean) => {
  const elementRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    // This setTimeout is crucial to make sure the scrollIntoView runs AFTER the effect setting scrollTop in ./index.tsx
    window.setTimeout(() => {
      if (enable && elementRef.current) {
        elementRef.current.scrollIntoView({
          behavior: 'smooth',
        })
      }
    }, 1)
  }, [enable])
  return elementRef
}
