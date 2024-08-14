import React from 'react'
import { RiExternalLinkLine, RiGitBranchLine } from 'react-icons/ri'

import { Flex, Spinner, Tag } from '../../components'

import classes from './style.module.css'
import { TransactionState } from '../../state'
import { ExecutionStatus } from '../../state/reducer'
import { useProvider } from '../ProvideProvider'

const SimulationStatus: React.FC<{
  transactionState: TransactionState
  mini?: boolean
}> = ({ transactionState, mini = false }) => {
  const provider = useProvider()

  if (mini) {
    return (
      <>
        {transactionState.status === ExecutionStatus.PENDING && (
          <Tag head={<Spinner />} color="info"></Tag>
        )}
        {transactionState.status === ExecutionStatus.SUCCESS && (
          <Tag head={<RiGitBranchLine />} color="success"></Tag>
        )}
        {transactionState.status === ExecutionStatus.FAILED ||
          (transactionState.status ===
            ExecutionStatus.META_TRANSACTION_REVERTED && (
            <Tag head={<RiGitBranchLine />} color="danger"></Tag>
          ))}
      </>
    )
  }

  return (
    <Flex
      gap={2}
      direction="column"
      justifyContent="space-between"
      alignItems="stretch"
    >
      <Flex gap={1} justifyContent="space-between" alignItems="center">
        <Flex gap={2} justifyContent="start" alignItems="center">
          <div className={classes.checkLabel}>Simulation</div>
          <Flex
            gap={0}
            justifyContent="center"
            className={classes.tagContainer}
          >
            {transactionState.status === ExecutionStatus.PENDING && (
              <Tag head={<Spinner />} color="info">
                Pending...
              </Tag>
            )}
            {transactionState.status === ExecutionStatus.SUCCESS && (
              <Tag head={<RiGitBranchLine />} color="success">
                Success
              </Tag>
            )}
            {transactionState.status === ExecutionStatus.FAILED && (
              <Tag head={<RiGitBranchLine />} color="danger">
                Failed
              </Tag>
            )}
            {transactionState.status ===
              ExecutionStatus.META_TRANSACTION_REVERTED && (
              <Tag head={<RiGitBranchLine />} color="danger">
                Reverted
              </Tag>
            )}
          </Flex>
        </Flex>

        {transactionState.transactionHash && (
          <a
            href={provider?.getTransactionLink(
              transactionState.transactionHash
            )}
            target="_blank"
            rel="noreferrer"
            className={classes.link}
          >
            View in Tenderly
            <RiExternalLinkLine />
          </a>
        )}
      </Flex>
    </Flex>
  )
}

export default SimulationStatus
