import React from 'react'
import {
  CallContractTransactionInput,
  NetworkId,
  useContractCall,
} from 'react-multisend'

import { Box } from '../../components'
import { useConnection } from '../../settings'

import classes from './style.module.css'

interface Props {
  value: CallContractTransactionInput
}

const CallContract: React.FC<Props> = ({ value }) => {
  const { provider } = useConnection()
  const { inputs } = useContractCall({
    value,
    onChange: () => {
      /*nothing here*/
    },
    network: provider.chainId.toString() as NetworkId,
    blockExplorerApiKey: process.env.ETHERSCAN_API_KEY,
  })

  return (
    <div className={classes.transaction}>
      {inputs.length > 0 && (
        <fieldset>
          {inputs.map((input) => (
            <label key={input.name}>
              <span>
                {input.name} <i className={classes.inputType}>{input.type}</i>
              </span>
              <Box p={1} bg>
                <input type="text" value={`${input.value || ''}`} readOnly />
              </Box>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  )
}

export default CallContract
