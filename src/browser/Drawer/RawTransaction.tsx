import React from 'react'
import { RawTransactionInput } from 'react-multisend'

import { Box } from '../../components'

import classes from './style.module.css'

interface Props {
  value: RawTransactionInput
}

const RawTransaction: React.FC<Props> = ({ value }) => (
  <div className={classes.transaction}>
    <label>
      <span>Data</span>
      <Box p={1} bg>
        <input
          className={classes.rawTxData}
          type="text"
          value={`${value.data || ''}`}
          readOnly
        />
      </Box>
    </label>
  </div>
)

export default RawTransaction
