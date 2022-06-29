import React, { useState } from 'react'

import { Box, Button, Drawer, Flex } from '../../components'
import { useCommitTransactions } from '../ProvideProvider'
import { useTransactions } from '../state'

import { Transaction } from './Transaction'
import classes from './style.module.css'

const TransactionsDrawer: React.FC = () => {
  const [expanded, setExpanded] = useState(true)
  const transactions = useTransactions()
  const commitTransactions = useCommitTransactions()

  return (
    <Drawer
      expanded={expanded}
      header={
        <>
          <h4 className={classes.header}>Recording Transactions</h4>
          <div className={classes.recordingIcon} />
        </>
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
              hash={transaction.transactionHash}
              index={index}
              value={transaction}
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
