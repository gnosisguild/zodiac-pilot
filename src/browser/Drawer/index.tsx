import React, { useState } from 'react'

import { Box, Drawer } from '../../components'
import { useTransactions } from '../state'

import { Transaction } from './Transaction'

const TransactionsDrawer: React.FC = () => {
  const [expanded, setExpanded] = useState(true)
  const transactions = useTransactions()

  return (
    <Drawer expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      <div>
        <Box p={2}>
          <h3>Transactions</h3>

          {transactions.map((transaction, index) => (
            <Transaction
              key={transaction.transactionHash || index}
              index={index}
              value={transaction}
            />
          ))}
        </Box>
      </div>
    </Drawer>
  )
}

export default TransactionsDrawer
