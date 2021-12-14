import React, { useState } from 'react'

import { Box, Drawer } from '../../components'

const TransactionsDrawer: React.FC = () => {
  const [expanded, setExpanded] = useState(true)
  return (
    <Drawer expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      <div>
        <Box p={2}>
          <h3>Transactions</h3>
        </Box>
      </div>
    </Drawer>
  )
}

export default TransactionsDrawer
