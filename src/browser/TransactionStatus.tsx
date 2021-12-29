import { IJsonRpcErrorMessage, ITxData } from '@walletconnect/types'
import React, { useEffect, useState } from 'react'
import { RiAlertLine } from 'react-icons/ri'

import { Box, Flex } from '../components'

import { useWrappingProvider } from './ProvideProvider'
import classes from './index.module.css'

// TODO implement this check once we know what Roles modifier errors will look like
const isPermissionError = (error: IJsonRpcErrorMessage) => false

const TransactionStatus: React.FC = () => {
  const wrappingProvider = useWrappingProvider()
  const [error, setError] = useState<IJsonRpcErrorMessage | null>(null)
  const [txData, setTxData] = useState<ITxData | null>(null)

  useEffect(() => {
    const captureError = (error: IJsonRpcErrorMessage, txData: ITxData) => {
      setError(error)
      setTxData(txData)
    }

    const clearError = () => {
      setError(null)
      setTxData(null)
    }

    wrappingProvider.on('estimateGasError', captureError)
    wrappingProvider.on('estimateGasSuccess', clearError)

    return () => {
      wrappingProvider.off('estimateGasError', captureError)
      wrappingProvider.off('estimateGasSuccess', clearError)
    }
  }, [wrappingProvider])

  if (!error || !isPermissionError(error)) {
    return null
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(txData, undefined, 2))
  }

  return (
    <Box borderless>
      <Flex gap={1}>
        <RiAlertLine color="#ffae42" size={24} />
        <div>
          This transaction is not permitted
          <button onClick={copyToClipboard} className={classes.copyButton}>
            Copy transaction data to clipboard
          </button>
        </div>
      </Flex>
    </Box>
  )
}

export default TransactionStatus
