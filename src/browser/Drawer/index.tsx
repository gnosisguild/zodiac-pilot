import { BigNumber } from 'ethers'
import React, { useState } from 'react'
import { RiRefreshLine } from 'react-icons/ri'
import { encodeSingle } from 'react-multisend'

import { Box, Button, Drawer, Flex, IconButton } from '../../components'
import { ForkProvider } from '../../providers'
import { useConnection } from '../../settings'
import { useCommitTransactions, useProvider } from '../ProvideProvider'
import { useDispatch, useTransactions } from '../state'

import { Transaction, TransactionBadge } from './Transaction'
import classes from './style.module.css'

const TransactionsDrawer: React.FC = () => {
  const [expanded, setExpanded] = useState(true)
  const transactions = useTransactions()
  const commitTransactions = useCommitTransactions()
  const dispatch = useDispatch()
  const provider = useProvider()
  const {
    connection: { avatarAddress },
  } = useConnection()

  const reforkAndRerun = async () => {
    // remove all transactions from the store
    dispatch({
      type: 'REMOVE_TRANSACTION',
      payload: { id: transactions[0].input.id },
    })

    if (!(provider instanceof ForkProvider)) {
      throw new Error('This is only supported when using ForkProvider')
    }

    await provider.refork()

    // re-simulate all transactions
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i]
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
      header={
        <>
          <h4 className={classes.header}>Recording Transactions</h4>
          <Flex gap={1} className={classes.headerButtons}>
            <IconButton
              title="Re-simulate on current blockchain head"
              disabled={transactions.length === 0}
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
            <Flex gap={1} className={classes.body} direction="column">
              {transactions.map((transaction, index) => (
                <TransactionBadge
                  key={transaction.transactionHash}
                  index={index}
                  {...transaction}
                />
              ))}
            </Flex>
          </Flex>
        </div>
      }
      onToggle={() => setExpanded(!expanded)}
    >
      <Flex
        gap={2}
        direction="column"
        alignItems="stretch"
        className={classes.wrapper}
      >
        <Flex gap={1} className={classes.body} direction="column">
          {transactions.map((transaction, index) => (
            <Transaction
              key={transaction.transactionHash}
              index={index}
              {...transaction}
            />
          ))}

          {transactions.length === 0 && (
            <p className={classes.hint}>
              As you interact with apps in the browser, transactions will be
              recorded here. You can then sign and submit them as a batch.
            </p>
          )}
        </Flex>
        <Box className={classes.footer}>
          <Button
            onClick={commitTransactions || undefined}
            disabled={!commitTransactions || transactions.length === 0}
          >
            Submit
          </Button>
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
