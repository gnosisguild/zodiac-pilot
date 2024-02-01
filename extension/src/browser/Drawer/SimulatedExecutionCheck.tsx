import { defaultAbiCoder } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { RiExternalLinkLine, RiGitBranchLine } from 'react-icons/ri'

import { Flex, Spinner, Tag } from '../../components'
import { useTenderlyProvider } from '../../providers'
import { TenderlyTransactionInfo } from '../../providers/ProvideTenderly'
import { useConnection } from '../../connections'
import { Connection } from '../../types'

import classes from './style.module.css'

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

  const [transactionInfo, setTransactionInfo] =
    useState<TenderlyTransactionInfo | null>(null)

  useEffect(() => {
    if (!tenderlyProvider) return
    if (!transactionHash) return

    let canceled = false

    const transactionInfoPromise =
      tenderlyProvider.getTransactionInfo(transactionHash)
    transactionInfoPromise.then((txInfo) => {
      if (!canceled) setTransactionInfo(txInfo)
    })

    return () => {
      canceled = true
    }
  }, [tenderlyProvider, transactionHash])

  let executionStatus = ExecutionStatus.PENDING
  if (transactionInfo?.status === false) {
    executionStatus = ExecutionStatus.REVERTED
  } else if (transactionInfo?.status === true) {
    if (
      transactionInfo.receipt.logs.length === 1 &&
      isExecutionFromModuleFailure(transactionInfo.receipt.logs[0], connection)
    ) {
      executionStatus = ExecutionStatus.MODULE_TRANSACTION_REVERTED
    } else {
      executionStatus = ExecutionStatus.SUCCESS
    }
  }

  if (mini) {
    return (
      <>
        {!transactionInfo && <Tag head={<Spinner />} color="info"></Tag>}
        {transactionInfo?.status && (
          <Tag head={<RiGitBranchLine />} color="success"></Tag>
        )}
        {transactionInfo && !transactionInfo.status && (
          <Tag head={<RiGitBranchLine />} color="danger"></Tag>
        )}
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
      </Flex>
    </Flex>
  )
}

export default SimulatedExecutionCheck

const isExecutionFromModuleFailure = (
  log: TenderlyTransactionInfo['receipt']['logs'][0],
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
