import React from 'react'
import { RawTransactionInput } from 'react-multisend'

interface Props {
  value: RawTransactionInput
}

export const RawTransaction: React.FC<Props> = ({ value }) => (
  <div>
    <label>
      <span>To</span> <i>address</i>
      <input type="text" readOnly value={value.to} />
    </label>
    <label>
      <span>Value (wei)</span>
      <input type="number" readOnly value={value.value} />
    </label>
    <label>
      <span>Data</span>
      <textarea readOnly value={value.data} />
    </label>
  </div>
)
