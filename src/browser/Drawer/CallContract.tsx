import React from 'react'
import { CallContractTransactionInput, useContractCall } from 'react-multisend'

interface Props {
  value: CallContractTransactionInput
}

const CallContract: React.FC<Props> = ({ value }) => {
  const { functions, payable, inputs, loading } = useContractCall({
    value,
    onChange: () => {
      /*TODO*/
    },
    network: '4',
    blockExplorerApiKey: process.env.ETHERSCAN_API_KEY,
  })

  return (
    <div>
      <label>
        <span>To</span> <i>address</i>
        <input type="text" readOnly value={value.to} />
      </label>
      <label>
        <span>Method</span>
        <select
          disabled={loading || !value.abi}
          value={value.functionSignature}
        >
          {functions.map((func) => (
            <option key={func.signature} value={func.signature}>
              {func.name}
            </option>
          ))}
        </select>
      </label>
      {payable && (
        <label>
          <span>Value (wei)</span>
          <input type="number" value={value.value} readOnly />
        </label>
      )}
      {inputs.length > 0 && (
        <fieldset>
          {inputs.map((input) => (
            <label key={input.name}>
              {input.name} <i>{input.type}</i>
              <input type="text" value={`${input.value || ''}`} readOnly />
            </label>
          ))}
        </fieldset>
      )}
    </div>
  )
}

export default CallContract
