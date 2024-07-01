import { KnownContracts } from '@gnosis.pm/zodiac'
import { BigNumber } from 'ethers'
import { formatEther, FunctionFragment } from 'ethers/lib/utils'
import React, { useEffect, useRef, useState } from 'react'

import { Box, Flex } from '../../components'
import ToggleButton from '../../components/Drawer/ToggleButton'
import { CHAIN_CURRENCY } from '../../chains'
import { useConnection } from '../../connections'
import { TransactionState } from '../../state'

import ContractAddress from './ContractAddress'
import CopyToClipboard from './CopyToClipboard'
import RawTransaction from './RawTransaction'
import { Remove } from './Remove'
import RolePermissionCheck from './RolePermissionCheck'
import SimulationStatus from './SimulationStatus'
import { Translate } from './Translate'
import classes from './style.module.css'
import DecodedTransaction from './DecodedTransaction'
import { useDecodedFunctionData } from './useDecodedFunctionData'

interface HeaderProps {
  index: number
  transactionState: TransactionState
  functionFragment?: FunctionFragment
  onExpandToggle(): void
  expanded: boolean
  showRoles?: boolean
}

const TransactionHeader: React.FC<HeaderProps> = ({
  index,
  transactionState,
  functionFragment,
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
          {functionFragment
            ? functionFragment.format('sighash').split('(')[0]
            : 'Raw transaction'}
          {transactionState.transaction.operation === 1 && (
            <code className={classes.delegateCall}>delegatecall</code>
          )}
        </h5>
      </label>
      <div className={classes.end}>
        <SimulationStatus transactionState={transactionState} mini />
        {showRoles && (
          <RolePermissionCheck
            transactionState={transactionState}
            index={index}
            mini
          />
        )}
        <Flex gap={0}>
          <Translate transactionState={transactionState} index={index} />
          <CopyToClipboard transaction={transactionState.transaction} />
          <Remove transactionState={transactionState} index={index} />
        </Flex>
      </div>
    </div>
  )
}

interface Props {
  transactionState: TransactionState
  index: number
  scrollIntoView: boolean
}

export const Transaction: React.FC<Props> = ({
  index,
  transactionState,
  scrollIntoView,
}) => {
  const [expanded, setExpanded] = useState(true)
  const { connection } = useConnection()
  const elementRef = useScrollIntoView(scrollIntoView)

  const decoded = useDecodedFunctionData(transactionState)

  const showRoles =
    (connection.moduleType === KnownContracts.ROLES_V1 ||
      connection.moduleType === KnownContracts.ROLES_V2) &&
    !!connection.roleId &&
    !!connection.pilotAddress // TODO remove this check once we can query role members via ser to get a fallback

  return (
    <Box ref={elementRef} p={2} className={classes.container}>
      <TransactionHeader
        index={index}
        transactionState={transactionState}
        functionFragment={decoded?.functionFragment}
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
                address={transactionState.transaction.to}
                contractInfo={transactionState.contractInfo}
                explorerLink
                className={classes.contractName}
              />
              <EtherValue value={transactionState.transaction.value} />
            </Flex>
          </Box>
          <TransactionStatus
            transactionState={transactionState}
            index={index}
            showRoles={showRoles}
          />

          <Box p={2} bg className={classes.transactionContainer}>
            {decoded ? (
              <DecodedTransaction {...decoded} />
            ) : (
              <RawTransaction data={transactionState.transaction.data} />
            )}
          </Box>
        </>
      )}
    </Box>
  )
}

export const TransactionBadge: React.FC<Props> = ({
  index,
  transactionState,
  scrollIntoView,
}) => {
  const { connection } = useConnection()

  const showRoles =
    (connection.moduleType === KnownContracts.ROLES_V1 ||
      connection.moduleType === KnownContracts.ROLES_V2) &&
    !!connection.roleId &&
    !!connection.pilotAddress // TODO remove this check once we can query role members via ser to get a fallback

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

      <SimulationStatus transactionState={transactionState} mini />

      {showRoles && (
        <RolePermissionCheck
          transactionState={transactionState}
          index={index}
          mini
        />
      )}
    </Box>
  )
}

interface StatusProps {
  transactionState: TransactionState
  showRoles?: boolean
  index: number
}

const TransactionStatus: React.FC<StatusProps> = ({
  transactionState,
  index,
  showRoles = false,
}) => (
  <Flex
    gap={1}
    justifyContent="space-between"
    className={classes.transactionStatus}
    direction="column"
  >
    <Box bg p={2} className={classes.statusHeader}>
      <SimulationStatus transactionState={transactionState} />
    </Box>

    {showRoles && (
      <Box bg p={2} className={classes.statusHeader}>
        <RolePermissionCheck
          transactionState={transactionState}
          index={index}
        />
      </Box>
    )}
  </Flex>
)

const EtherValue: React.FC<{ value: string }> = ({ value }) => {
  const {
    connection: { chainId },
  } = useConnection()

  const valueBN = BigNumber.from(value || 0)

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
