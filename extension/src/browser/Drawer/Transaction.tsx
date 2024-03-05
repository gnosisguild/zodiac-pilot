import { KnownContracts } from '@gnosis.pm/zodiac'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { TransactionInput, TransactionType } from 'react-multisend'

import { Box, Flex } from '../../components'
import ToggleButton from '../../components/Drawer/ToggleButton'
import { CHAIN_CURRENCY } from '../../chains'
import { useConnection } from '../../connections'
import { TransactionState } from '../../state'

import CallContract from './CallContract'
import ContractAddress from './ContractAddress'
import CopyToClipboard from './CopyToClipboard'
import RawTransaction from './RawTransaction'
import { Remove } from './Remove'
import RolePermissionCheck from './RolePermissionCheck'
import SimulatedExecutionCheck from './SimulatedExecutionCheck'
import { Translate } from './Translate'
import classes from './style.module.css'

interface HeaderProps {
  index: number
  input: TransactionInput
  isDelegateCall: boolean
  transactionHash: TransactionState['transactionHash']
  onExpandToggle(): void
  expanded: boolean
  showRoles?: boolean
}

const TransactionHeader: React.FC<HeaderProps> = ({
  index,
  input,
  isDelegateCall,
  transactionHash,
  onExpandToggle,
  expanded,
  showRoles = false,
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
          {isDelegateCall && (
            <code className={classes.delegateCall}>delegatecall</code>
          )}
        </h5>
      </label>
      <div className={classes.end}>
        {transactionHash && (
          <SimulatedExecutionCheck transactionHash={transactionHash} mini />
        )}

        {showRoles && (
          <RolePermissionCheck
            transaction={input}
            isDelegateCall={isDelegateCall}
            index={index}
            mini
          />
        )}

        <Flex gap={0}>
          <Translate
            transaction={input}
            isDelegateCall={isDelegateCall}
            index={index}
          />
          <CopyToClipboard
            transaction={input}
            isDelegateCall={isDelegateCall}
          />
          <Remove transaction={input} index={index} />
        </Flex>
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
  isDelegateCall,
  scrollIntoView,
}) => {
  const [expanded, setExpanded] = useState(true)
  const { connection } = useConnection()
  const elementRef = useScrollIntoView(scrollIntoView)
  const showRoles =
    (connection.moduleType === KnownContracts.ROLES_V1 ||
      connection.moduleType === KnownContracts.ROLES_V2) &&
    !!connection.roleId &&
    !!connection.pilotAddress // TODO remove this check once we can query role members via ser to get a fallback

  return (
    <Box ref={elementRef} p={2} className={classes.container}>
      <TransactionHeader
        index={index}
        input={input}
        isDelegateCall={isDelegateCall}
        transactionHash={transactionHash}
        expanded={expanded}
        onExpandToggle={() => setExpanded(!expanded)}
        showRoles={showRoles}
      />
      {expanded && (
        <>
          <Box bg p={2} className={classes.subtitleContainer}>
            <Flex
              gap={3}
              alignItems="center"
              justifyContent="space-between"
              className={classes.transactionSubtitle}
            >
              <ContractAddress
                address={input.to}
                explorerLink
                className={classes.contractName}
              />
              <EtherValue input={input} />
            </Flex>
          </Box>
          <TransactionStatus
            input={input}
            isDelegateCall={isDelegateCall}
            index={index}
            transactionHash={transactionHash}
            showRoles={showRoles}
          />
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
  isDelegateCall,
  scrollIntoView,
}) => {
  const { connection } = useConnection()
  const showRoles =
    connection.moduleType === KnownContracts.ROLES_V1 ||
    connection.moduleType === KnownContracts.ROLES_V2

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

      {showRoles && (
        <RolePermissionCheck
          transaction={input}
          isDelegateCall={isDelegateCall}
          index={index}
          mini
        />
      )}
    </Box>
  )
}

interface StatusProps extends TransactionState {
  showRoles?: boolean
  index: number
}

const TransactionStatus: React.FC<StatusProps> = ({
  input,
  isDelegateCall,
  transactionHash,
  index,
  showRoles = false,
}) => (
  <Flex
    gap={1}
    justifyContent="space-between"
    className={classes.transactionStatus}
    direction="column"
  >
    {transactionHash && (
      <Box bg p={2} className={classes.statusHeader}>
        <SimulatedExecutionCheck transactionHash={transactionHash} />
      </Box>
    )}
    {showRoles && (
      <Box bg p={2} className={classes.statusHeader}>
        <RolePermissionCheck
          transaction={input}
          isDelegateCall={isDelegateCall}
          index={index}
        />
      </Box>
    )}
  </Flex>
)

const EtherValue: React.FC<{ input: TransactionInput }> = ({ input }) => {
  const {
    connection: { chainId },
  } = useConnection()
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
    <Flex
      gap={1}
      alignItems="baseline"
      justifyContent="space-between"
      className={classes.value}
    >
      <div>{CHAIN_CURRENCY[chainId]}:</div>
      <code className={classes.valueValue}>
        {valueBN.isZero() ? 'n/a' : formatEther(valueBN)}
      </code>
    </Flex>
  )
}

const useScrollIntoView = (enable: boolean) => {
  const elementRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!enable || !elementRef.current) return

    const scrollParent = getScrollParent(elementRef.current)
    if (!scrollParent) return

    // scroll to it right away
    elementRef.current.scrollIntoView({
      behavior: 'smooth',
    })

    // keep it in view while it grows
    const resizeObserver = new ResizeObserver(() => {
      elementRef.current?.scrollIntoView({
        behavior: 'smooth',
      })

      // this delay must be greater than the browser's native scrollIntoView animation duration
      window.setTimeout(() => {
        scrollParent.addEventListener('scroll', stopObserving)
      }, 1000)
    })
    resizeObserver.observe(elementRef.current)

    // stop keeping it in view once the user scrolls
    const stopObserving = () => {
      resizeObserver.disconnect()
      scrollParent.removeEventListener('scroll', stopObserving)
    }

    return () => {
      stopObserving()
    }
  }, [enable])
  return elementRef
}

function getScrollParent(node: Element | null): Element | null {
  if (node === null) {
    return null
  }

  if (node.scrollHeight > node.clientHeight) {
    return node
  } else {
    return getScrollParent(node.parentElement)
  }
}
