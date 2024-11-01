import { Box } from '@/components'
import React from 'react'
import classes from './style.module.css'

interface Props {
  data: string
}

export const RawTransaction: React.FC<Props> = ({ data }) => (
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
