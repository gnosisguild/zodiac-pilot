import React from 'react'
import { useEffect, useState } from 'react'
import { RiGroupLine } from 'react-icons/ri'
import { encodeSingle, TransactionInput } from 'react-multisend'

import { Flex, Tag } from '../../components'
import { useApplicableTranslation } from '../../transactionTranslations'
import { JsonRpcError } from '../../types'
import { decodeRolesV1Error } from '../../utils'
import { isPermissionsError } from '../../utils/decodeError'
import { useWrappingProvider } from '../ProvideProvider'

import CopyToClipboard from './CopyToClipboard'
import { Translate } from './Translate'
import classes from './style.module.css'

const RolePermissionCheck: React.FC<{
  transaction: TransactionInput
  isDelegateCall: boolean
  index: number
  mini?: boolean
}> = ({ transaction, isDelegateCall, index, mini = false }) => {
  const [error, setError] = useState<string | undefined | false>(undefined)
  const wrappingProvider = useWrappingProvider()

  const encodedTransaction = encodeSingle(transaction)
  const translationAvailable = !!useApplicableTranslation(encodedTransaction)

  useEffect(() => {
    let canceled = false
    wrappingProvider
      .request({
        method: 'eth_estimateGas',
        params: [encodedTransaction],
      })
      .then(() => {
        if (!canceled) setError(false)
      })
      .catch((e: JsonRpcError) => {
        const decodedError = decodeRolesV1Error(e)
        if (!canceled) {
          setError(isPermissionsError(decodedError) ? decodedError : false)
        }
        if (!isPermissionsError(decodedError)) {
          throw e
        }
      })

    return () => {
      canceled = true
    }
  }, [wrappingProvider, encodedTransaction])

  if (error === undefined) return null

  if (mini) {
    return (
      <>
        {error === false ? (
          <Tag head={<RiGroupLine />} color="success"></Tag>
        ) : (
          <Tag head={<RiGroupLine />} color="danger"></Tag>
        )}
      </>
    )
  }

  return (
    <Flex gap={2} direction="column" justifyContent="space-between">
      <Flex gap={2} justifyContent="space-between" alignItems="center">
        <Flex gap={2} justifyContent="start" alignItems="center">
          <div className={classes.checkLabel}>Role permissions</div>

          <Flex
            gap={0}
            justifyContent="center"
            className={classes.tagContainer}
          >
            {error === false ? (
              <Tag head={<RiGroupLine />} color="success">
                Allowed
              </Tag>
            ) : (
              <Tag head={<RiGroupLine />} color="danger">
                {error}
              </Tag>
            )}
          </Flex>
        </Flex>
        {error && !!translationAvailable && (
          <Translate
            transaction={transaction}
            isDelegateCall={isDelegateCall}
            index={index}
            labeled
          />
        )}
        {error && !translationAvailable && (
          <CopyToClipboard
            transaction={transaction}
            isDelegateCall={isDelegateCall}
            labeled
          />
        )}
      </Flex>
    </Flex>
  )
}

export default RolePermissionCheck
