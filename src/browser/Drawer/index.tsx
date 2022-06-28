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
      header={<h4 className={classes.header}>Transactions</h4>}
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
              value={transaction}
            />
          ))}
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
