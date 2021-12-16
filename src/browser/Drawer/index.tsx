import React, { useState } from 'react'

import { Box, Button, Drawer } from '../../components'
import { useCommitTransactions } from '../ProvideProvider'
import { useTransactions } from '../state'

import { Transaction } from './Transaction'

const TransactionsDrawer: React.FC = () => {
  const [expanded, setExpanded] = useState(true)
  const transactions = useTransactions()
  const commitTransactions = useCommitTransactions()

  return (
    <Drawer expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      <div>
        <Box p={2}>
          <h3>Transactions</h3>

          <div>
            {transactions.map((transaction, index) => (
              <Transaction
                key={transaction.transactionHash}
                index={index}
                value={transaction}
              />
            ))}
          </div>

          <Button
            onClick={commitTransactions || undefined}
            disabled={!commitTransactions || transactions.length === 0}
          >
            Submit
          </Button>
        </Box>
      </div>
    </Drawer>
  )
}

export default TransactionsDrawer
