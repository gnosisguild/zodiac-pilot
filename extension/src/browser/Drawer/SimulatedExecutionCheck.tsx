import React, { useEffect, useState } from 'react'
import { RiExternalLinkLine, RiGitBranchLine } from 'react-icons/ri'

import { Flex, Spinner, Tag } from '../../components'
import { useTenderlyProvider } from '../../providers'
import { TenderlyTransactionInfo } from '../../providers/ProvideTenderly'

import classes from './style.module.css'

const SimulatedExecutionCheck: React.FC<{
  transactionHash: string
  mini?: boolean
}> = ({ transactionHash, mini = false }) => {
  const tenderlyProvider = useTenderlyProvider()

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
            {!transactionInfo && (
              <Tag head={<Spinner />} color="info">
                Pending...
              </Tag>
            )}
            {transactionInfo?.status && (
              <Tag head={<RiGitBranchLine />} color="success">
                Success
              </Tag>
            )}
            {transactionInfo && !transactionInfo.status && (
              <Tag head={<RiGitBranchLine />} color="danger">
                Reverted
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
