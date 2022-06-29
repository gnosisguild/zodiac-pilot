import React from 'react'
import { RawTransactionInput } from 'react-multisend'

import classes from './style.module.css'

interface Props {
  value: RawTransactionInput
}

const RawTransaction: React.FC<Props> = ({ value }) => (
  <div className={classes.transaction}>
    <label>
      <span>Data</span>
      <textarea readOnly value={value.data} />
    </label>
  </div>
)

export default RawTransaction
