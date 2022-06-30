import React from 'react'
import { RawTransactionInput } from 'react-multisend'

import classes from './style.module.css'

interface Props {
  value: RawTransactionInput
}

const RawTransaction: React.FC<Props> = ({ value }) => (
  <div className={classes.transaction}>
    <label>
      <div className={classes.rawTxData}>{value.data}</div>
    </label>
  </div>
)

export default RawTransaction
