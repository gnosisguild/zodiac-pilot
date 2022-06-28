import React from 'react'
import {
  CallContractTransactionInput,
  NetworkId,
  useContractCall,
} from 'react-multisend'

import { useConnection } from '../../settings'

import classes from './style.module.css'

interface Props {
  value: CallContractTransactionInput
}

const CallContract: React.FC<Props> = ({ value }) => {
  const { provider } = useConnection()
  const { functions, payable, inputs, loading } = useContractCall({
    value,
    onChange: () => {
      /*TODO*/
    },
    network: provider.chainId.toString() as NetworkId,
    blockExplorerApiKey: process.env.ETHERSCAN_API_KEY,
  })

  return (
    <div className={classes.contractCall}>
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

      {payable && (
        <label>
          <span>Value (wei)</span>
          <input type="number" value={value.value} readOnly />
        </label>
      )}
    </div>
  )
}

export default CallContract
