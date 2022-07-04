import React, { SyntheticEvent } from 'react'
import { useEffect, useState } from 'react'
import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiFileCopy2Line,
} from 'react-icons/ri'
import { encodeSingle, TransactionInput } from 'react-multisend'

import { Flex, Tag } from '../../components'
import { decodeRolesError } from '../../utils'
import { isPermissionsError } from '../../utils/decodeRolesError'
import { useWrappingProvider } from '../ProvideProvider'

import classes from './style.module.css'

const RolePermissionCheck: React.FC<{ transaction: TransactionInput }> = ({
  transaction,
}) => {
  const [error, setError] = useState<string | undefined | false>(undefined)
  const wrappingProvider = useWrappingProvider()

  const transactionEncoded = encodeSingle(transaction)

  useEffect(() => {
    let canceled = false
    wrappingProvider
      .request({
        method: 'eth_estimateGas',
        params: [transactionEncoded],
      })
      .then(() => {
        if (!canceled) setError(false)
      })
      .catch((e: string) => {
        const decodedError = decodeRolesError(e)
        if (!canceled) {
          setError(isPermissionsError(decodedError) ? decodedError : false)
        }
      })

    return () => {
      canceled = true
    }
  }, [wrappingProvider, transactionEncoded])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      JSON.stringify(transactionEncoded, undefined, 2)
    )
  }

  if (error === undefined) return null

  return (
    <Flex gap={2}>
      <div>Role permissions</div>
      <div>
        {error === false ? (
          <Tag head={<RiCheckboxCircleLine />} color="success">
            Permitted
          </Tag>
        ) : (
          <Tag head={<RiErrorWarningLine />} color="danger">
            {error}
          </Tag>
        )}
      </div>
      {error && (
        <div>
          <button onClick={copyToClipboard} className={classes.link}>
            Copy transaction data to clipboard
            <RiFileCopy2Line />
          </button>
        </div>
      )}
    </Flex>
  )
}

export default RolePermissionCheck
