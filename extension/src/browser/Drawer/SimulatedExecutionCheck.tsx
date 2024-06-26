import { defaultAbiCoder } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { RiExternalLinkLine, RiGitBranchLine } from 'react-icons/ri'

import { Flex, Spinner, Tag } from '../../components'
import { useTenderlyProvider } from '../../providers'
import { useConnection } from '../../connections'
import { Connection } from '../../types'

import classes from './style.module.css'
import { TransactionReceipt, Web3Provider } from '@ethersproject/providers'

enum ExecutionStatus {
  PENDING,
  SUCCESS,
  REVERTED,
  MODULE_TRANSACTION_REVERTED,
}

const SimulatedExecutionCheck: React.FC<{
  transactionHash: string
  mini?: boolean
}> = ({ transactionHash, mini = false }) => {
  const tenderlyProvider = useTenderlyProvider()
  const { connection } = useConnection()

  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>(
    ExecutionStatus.PENDING
  )

  useEffect(() => {
    if (!tenderlyProvider) return
    if (!transactionHash) return

    let canceled = false

    const provider = new Web3Provider(tenderlyProvider)
    provider.getTransactionReceipt(transactionHash).then((receipt) => {
      if (canceled) return

      if (!receipt.status) {
        setExecutionStatus(ExecutionStatus.REVERTED)
        return
      }

      if (
        receipt.logs.length === 1 &&
        isExecutionFromModuleFailure(receipt.logs[0], connection)
      ) {
        setExecutionStatus(ExecutionStatus.MODULE_TRANSACTION_REVERTED)
      } else {
        setExecutionStatus(ExecutionStatus.SUCCESS)
      }
    })

    return () => {
      canceled = true
    }
  }, [tenderlyProvider, transactionHash, connection])

  if (mini) {
    return (
      <>
        {executionStatus === ExecutionStatus.PENDING && (
          <Tag head={<Spinner />} color="info"></Tag>
        )}
        {executionStatus === ExecutionStatus.SUCCESS && (
          <Tag head={<RiGitBranchLine />} color="success"></Tag>
        )}
        {executionStatus === ExecutionStatus.REVERTED ||
          (executionStatus === ExecutionStatus.MODULE_TRANSACTION_REVERTED && (
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
            {executionStatus === ExecutionStatus.PENDING && (
              <Tag head={<Spinner />} color="info">
                Pending...
              </Tag>
            )}
            {executionStatus === ExecutionStatus.SUCCESS && (
              <Tag head={<RiGitBranchLine />} color="success">
                Success
              </Tag>
            )}
            {executionStatus === ExecutionStatus.REVERTED && (
              <Tag head={<RiGitBranchLine />} color="danger">
                Reverted
              </Tag>
            )}
            {executionStatus ===
              ExecutionStatus.MODULE_TRANSACTION_REVERTED && (
              <Tag head={<RiGitBranchLine />} color="danger">
                Module transaction reverted
              </Tag>
            )}
          </Flex>
        </Flex>

        <a
          href={tenderlyProvider?.getTransactionLink(transactionHash)}
          target="_blank"
          rel="noreferrer"
          className={classes.link}
        >
          View in Tenderly
          <RiExternalLinkLine />
        </a>
      </Flex>
    </Flex>
  )
}

export default SimulatedExecutionCheck

const isExecutionFromModuleFailure = (
  log: TransactionReceipt['logs'][0],
  connection: Connection
) => {
  return (
    log.address.toLowerCase() === connection.avatarAddress.toLowerCase() &&
    log.topics[0] ===
      '0xacd2c8702804128fdb0db2bb49f6d127dd0181c13fd45dbfe16de0930e2bd375' && // ExecutionFromModuleFailure(address)
    log.topics[1] ===
      defaultAbiCoder.encode(['address'], [connection.moduleAddress])
  )
}
