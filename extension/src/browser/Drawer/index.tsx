import React, { useEffect, useRef, useState } from 'react'
import { RiFileCopy2Line, RiRefreshLine } from 'react-icons/ri'
import { encodeMulti } from 'ethers-multisend'
import { toast } from 'react-toastify'

import { BlockButton, Button, Drawer, Flex, IconButton } from '../../components'
import { ForkProvider } from '../../providers'
import { wrapRequest } from '../../providers/WrappingProvider'
import { useRoute } from '../../routes'
import { useProvider } from '../ProvideProvider'
import {
  useAllTransactions,
  useDispatch,
  useNewTransactions,
} from '../../state'

import Submit from './Submit'
import { Transaction, TransactionBadge } from './Transaction'
import classes from './style.module.css'
import { asLegacyConnection } from '../../routes/legacyConnectionMigrations'

const TransactionsDrawer: React.FC = () => {
  const [expanded, setExpanded] = useState(true)
  const allTransactions = useAllTransactions()
  const newTransactions = useNewTransactions()
  const dispatch = useDispatch()
  const provider = useProvider()
  const { route } = useRoute()

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const [scrollItemIntoView, setScrollItemIntoView] = useState<
    number | undefined
  >(undefined)

  const lengthRef = useRef(0)
  useEffect(() => {
    if (newTransactions.length > lengthRef.current) {
      setScrollItemIntoView(newTransactions.length - 1)
    }

    lengthRef.current = newTransactions.length
  }, [newTransactions])

  const reforkAndRerun = async () => {
    // remove all transactions from the store
    dispatch({
      type: 'REMOVE_TRANSACTION',
      payload: { snapshotId: allTransactions[0].snapshotId },
    })

    if (!(provider instanceof ForkProvider)) {
      throw new Error('This is only supported when using ForkProvider')
    }

    await provider.refork()

    // re-simulate all new transactions (assuming the already submitted ones have already been mined on the fresh fork)
    for (const transaction of newTransactions) {
      await provider.sendMetaTransaction(transaction.transaction)
    }
  }

  const copyTransactionData = () => {
    const metaTransactions = newTransactions.map(
      (txState) => txState.transaction
    )
    const connection = asLegacyConnection(route)
    const batchTransaction =
      metaTransactions.length === 1
        ? metaTransactions[0]
        : encodeMulti(metaTransactions, connection.multisend)
    const finalRequest = connection.moduleAddress
      ? wrapRequest(batchTransaction, connection)
      : batchTransaction
    navigator.clipboard.writeText(JSON.stringify(finalRequest, undefined, 2))
    toast(<>Transaction data has been copied to clipboard.</>)
  }

  return (
    <Drawer
      expanded={expanded}
      onToggle={() => {
        setScrollItemIntoView(undefined) // clear scrollItemIntoView so that the original scroll position is restored
        setExpanded(!expanded)
      }}
      collapsedChildren={
        <div className={classes.collapsed}>
          <div className={classes.recordingIcon} />
          <Flex
            gap={2}
            direction="column"
            alignItems="stretch"
            className={classes.wrapper}
          >
            <Flex
              gap={1}
              data-collapsed={true}
              ref={scrollContainerRef}
              className={classes.body + ' coll'}
              direction="column"
            >
              {newTransactions.map((transactionState, index) => (
                <BlockButton
                  key={transactionState.snapshotId}
                  onClick={(ev) => {
                    ev.stopPropagation()
                    setScrollItemIntoView(index)
                    setExpanded(true)
                  }}
                >
                  <TransactionBadge
                    index={index}
                    transactionState={transactionState}
                    scrollIntoView={scrollItemIntoView === index}
                  />
                </BlockButton>
              ))}
            </Flex>
          </Flex>
        </div>
      }
    >
      <Flex gap={2} alignItems="center">
        <h4 className={classes.header}>Recording Transactions</h4>
        <Flex gap={1} className={classes.headerButtons}>
          <Flex gap={0}>
            <IconButton
              title="Copy batch transaction data to clipboard"
              disabled={newTransactions.length === 0}
              onClick={copyTransactionData}
            >
              <RiFileCopy2Line />
            </IconButton>
            <IconButton
              title="Re-simulate on current blockchain head"
              disabled={newTransactions.length === 0}
              onClick={reforkAndRerun}
            >
              <RiRefreshLine />
            </IconButton>
          </Flex>
          <div className={classes.recordingIcon} />
        </Flex>
      </Flex>
      <Flex
        gap={2}
        direction="column"
        alignItems="stretch"
        className={classes.wrapper}
      >
        <Flex
          gap={4}
          ref={scrollContainerRef}
          className={classes.body + ' exp'}
          direction="column"
        >
          {newTransactions.map((transactionState, index) => (
            <Transaction
              key={transactionState.snapshotId}
              transactionState={transactionState}
              index={index}
              scrollIntoView={scrollItemIntoView === index}
            />
          ))}

          {newTransactions.length === 0 && (
            <p className={classes.hint}>
              As you interact with apps in the browser, transactions will be
              recorded here. You can then sign and submit them as a batch.
            </p>
          )}
        </Flex>
        <Flex justifyContent="space-between" gap={2}>
          {!route.initiator && (
            <Button
              secondary
              onClick={copyTransactionData}
              disabled={newTransactions.length === 0}
            >
              Copy transaction data
            </Button>
          )}
          <Submit />
        </Flex>
      </Flex>
    </Drawer>
  )
}

export default TransactionsDrawer
