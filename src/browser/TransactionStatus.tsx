import { ITxData } from '@walletconnect/types'
import React, { useEffect, useState } from 'react'
import { RiAlertLine, RiCloseFill } from 'react-icons/ri'

import { Box, Flex, IconButton } from '../components'
import { Permissions__factory, Roles__factory } from '../types/typechain'
import { decodeRolesError } from '../utils'

import { useWrappingProvider } from './ProvideProvider'
import classes from './index.module.css'

const permissionsInterface = Permissions__factory.createInterface()
const rolesInterface = Roles__factory.createInterface()

const KNOWN_ERRORS = Object.keys(rolesInterface.errors).concat(
  Object.keys(permissionsInterface.errors)
)

const TransactionStatus: React.FC = () => {
  const wrappingProvider = useWrappingProvider()
  const [error, setError] = useState<string | null>(null)
  const [txData, setTxData] = useState<ITxData | null>(null)

  useEffect(() => {
    const captureError = (error: string, params: [ITxData, any]) => {
      setError(decodeRolesError(error))
      setTxData(params[0])
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

  if (!error) {
    return null
  }

  console.warn('gas estimation error', error)
  const decodedError = decodeRolesError(error)

  if (!error) {
    return null
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(txData, undefined, 2))
  }

  return (
    <Box bg p={3} classNames={classes.statusBox}>
      <Flex gap={3}>
        <RiAlertLine color="#ffae42" size={24} />{' '}
        <div>
          {KNOWN_ERRORS.includes(decodedError) ? (
            <>
              <p>This transaction is not permitted:</p>
              <p className={classes.decodedError}>{decodedError}</p>
            </>
          ) : (
            <>
              <p>Unexpected error:</p>
              <p className={classes.decodedError}>{decodedError}</p>
            </>
          )}
          {txData && (
            <button onClick={copyToClipboard} className={classes.copyButton}>
              Copy transaction data to clipboard
            </button>
          )}
        </div>
        <div>
          <IconButton
            onClick={() => {
              setError(null)
              setTxData(null)
            }}
            className={classes.statusClose}
          >
            <RiCloseFill size={24} />
          </IconButton>
        </div>
      </Flex>
    </Box>
  )
}

export default TransactionStatus
