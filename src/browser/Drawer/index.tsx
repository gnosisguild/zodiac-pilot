import { BigNumber } from 'ethers'
import React, { useEffect, useRef, useState } from 'react'
import { RiRefreshLine } from 'react-icons/ri'
import { encodeSingle } from 'react-multisend'

import { BlockButton, Box, Drawer, Flex, IconButton } from '../../components'
import { ForkProvider } from '../../providers'
import { useConnection } from '../../settings'
import { useProvider } from '../ProvideProvider'
import { useAllTransactions, useDispatch, useNewTransactions } from '../state'

import Submit from './Submit'
import { Transaction, TransactionBadge } from './Transaction'
import classes from './style.module.css'

const TransactionsDrawer: React.FC = () => {
  const [expanded, setExpanded] = useState(true)
  const allTransactions = useAllTransactions()
  const newTransactions = useNewTransactions()
  const dispatch = useDispatch()
  const provider = useProvider()
  const {
    connection: { avatarAddress },
  } = useConnection()

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const scrollTopExpanded = useRef<number | undefined>(undefined)
  const scrollTopCollapsed = useRef<number | undefined>(undefined)

  const toggle = () => {
    // remember scroll position on unmount of scroll container
    if (expanded) {
      scrollTopExpanded.current = scrollContainerRef.current?.scrollTop
    } else {
      scrollTopCollapsed.current = scrollContainerRef.current?.scrollTop
    }

    setExpanded(!expanded)
  }

  // We run 2 concurrent effects: This one must run first and restores the previous scroll position.
  // The other one lives in the Transaction component and is responsible for scrolling one particular item into view.
  // We must ensure that the effects will always run in the correct order, which is why we use window.setTimeout in the Transaction component's effect.
  useEffect(() => {
    // restore previous scroll position on mount of scroll container
    const scrollContainerElement = scrollContainerRef.current
    const scrollTop = expanded
      ? scrollTopExpanded.current
      : scrollTopCollapsed.current
    if (scrollContainerElement && scrollTop) {
      scrollContainerElement.scrollTop = scrollTop
    }
  }, [expanded])

  const [scrollItemIntoView, setScrollItemIntoView] = useState<
    number | undefined
  >(undefined)

  const lengthRef = useRef(0)
  useEffect(() => {
    if (newTransactions.length > lengthRef.current) {
      setScrollItemIntoView(newTransactions.length)
    }

    lengthRef.current = newTransactions.length
  }, [newTransactions])

  const reforkAndRerun = async () => {
    // remove all transactions from the store
    dispatch({
      type: 'REMOVE_TRANSACTION',
      payload: { id: allTransactions[0].input.id },
    })

    if (!(provider instanceof ForkProvider)) {
      throw new Error('This is only supported when using ForkProvider')
    }

    await provider.refork()

    // re-simulate all transactions
    for (let i = 0; i < allTransactions.length; i++) {
      const transaction = allTransactions[i]
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
    <Drawer
      expanded={expanded}
      onToggle={() => {
        setScrollItemIntoView(undefined) // clear scrollItemIntoView so that the original scroll position is restored
        toggle()
      }}
      header={
        <>
          <h4 className={classes.header}>Recording Transactions</h4>
          <Flex gap={1} className={classes.headerButtons}>
            <IconButton
              title="Re-simulate on current blockchain head"
              disabled={newTransactions.length === 0}
              onClick={reforkAndRerun}
            >
              <RiRefreshLine />
            </IconButton>
            <div className={classes.recordingIcon} />
          </Flex>
        </>
      }
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
              {newTransactions.map((transaction, index) => (
                <BlockButton
                  key={transaction.transactionHash}
                  onClick={(ev) => {
                    ev.stopPropagation()
                    setScrollItemIntoView(index)
                    toggle()
                  }}
                >
                  <TransactionBadge
                    index={index}
                    scrollIntoView={scrollItemIntoView === index}
                    {...transaction}
                  />
                </BlockButton>
              ))}
            </Flex>
          </Flex>
        </div>
      }
    >
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
          {newTransactions.map((transaction, index) => (
            <Transaction
              key={transaction.transactionHash}
              index={index}
              scrollIntoView={scrollItemIntoView === index}
              {...transaction}
            />
          ))}

          {newTransactions.length === 0 && (
            <p className={classes.hint}>
              As you interact with apps in the browser, transactions will be
              recorded here. You can then sign and submit them as a batch.
            </p>
          )}
        </Flex>
        <Box p={2} bg>
          <Submit />
        </Box>
      </Flex>
    </Drawer>
  )
}

export default TransactionsDrawer

// Tenderly has particular requirements for the encoding of value: it must not have any leading zeros
const formatValue = (value: string): string => {
  const valueBN = BigNumber.from(value)
  if (valueBN.isZero()) return '0x0'
  else return valueBN.toHexString().replace(/^0x(0+)/, '0x')
}
