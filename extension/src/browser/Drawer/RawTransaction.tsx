import React from 'react'

import { Box } from '../../components'

import classes from './style.module.css'

interface Props {
  data: string
}

const RawTransaction: React.FC<Props> = ({ data }) => (
  <div className={classes.transaction}>
    <label>
      <span>Data</span>
      <Box p={1} bg>
        <input
          className={classes.rawTxData}
          type="text"
          value={data || ''}
          readOnly
        />
      </Box>
    </label>
  </div>
)

export default RawTransaction
