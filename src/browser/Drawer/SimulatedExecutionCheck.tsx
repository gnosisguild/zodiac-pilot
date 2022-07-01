import React, { useEffect, useState } from 'react'
import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiExternalLinkLine,
} from 'react-icons/ri'

import { Flex, Spinner, Tag } from '../../components'
import { useTenderlyProvider } from '../../providers'
import { TenderlyTransactionInfo } from '../../providers/ProvideTenderly'

import classes from './style.module.css'

const SimulatedExecutionCheck: React.FC<{ transactionHash: string }> = ({
  transactionHash,
}) => {
  const tenderlyProvider = useTenderlyProvider()

  const [transactionInfo, setTransactionInfo] =
    useState<TenderlyTransactionInfo | null>(null)

  useEffect(() => {
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

  return (
    <Flex gap={2}>
      <div>Simulated execution</div>
      <div>
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
      </div>
      {transactionInfo && (
        <div>
          <a
            href={transactionInfo.dashboardLink}
            target="_blank"
            rel="noreferrer"
            className={classes.link}
          >
            View in Tenderly
            <RiExternalLinkLine />
          </a>
        </div>
      )}
    </Flex>
  )
}

export default SimulatedExecutionCheck
