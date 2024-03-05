import React, { useMemo } from 'react'
import { useEffect, useState } from 'react'
import { RiGroupLine } from 'react-icons/ri'
import { encodeSingle, TransactionInput } from 'react-multisend'

import { Flex, Tag } from '../../components'
import { useApplicableTranslation } from '../../transactionTranslations'
import { Connection, JsonRpcError, TransactionData } from '../../types'
import { decodeRolesV1Error } from '../../utils'
import { decodeRolesV2Error, isPermissionsError } from '../../utils/decodeError'

import CopyToClipboard from './CopyToClipboard'
import { Translate } from './Translate'
import classes from './style.module.css'
import { useConnection } from '../../connections'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { wrapRequest } from '../../providers/WrappingProvider'
import { useTenderlyProvider } from '../../providers'
import { TenderlyProvider } from '../../providers/ProvideTenderly'

const simulateRolesTransaction = async (
  encodedTransaction: TransactionData,
  connection: Connection,
  tenderlyProvider: TenderlyProvider
) => {
  const wrappedTransaction = wrapRequest(encodedTransaction, connection, false)

  // TODO enable this once we can query role members from ser
  // if (!wrappedTransaction.from && connection.roleId) {
  //   // If pilotAddress is not yet determined, we will use a random member of the specified role
  //   wrappedTransaction.from = await getRoleMember(connection)
  // }

  try {
    await tenderlyProvider.request({
      method: 'eth_estimateGas',
      params: [wrappedTransaction],
    })
  } catch (e) {
    const decodedError =
      connection.moduleType === KnownContracts.ROLES_V1
        ? decodeRolesV1Error(e as JsonRpcError)
        : decodeRolesV2Error(e as JsonRpcError)

    if (!decodedError) {
      console.error('Unexpected error', e)
    }

    return decodedError && isPermissionsError(decodedError.signature)
      ? decodedError.signature
      : false
  }

  return false
}

const RolePermissionCheck: React.FC<{
  transaction: TransactionInput
  isDelegateCall: boolean
  index: number
  mini?: boolean
}> = ({ transaction, isDelegateCall, index, mini = false }) => {
  const [error, setError] = useState<string | undefined | false>(undefined)
  const { connection } = useConnection()
  const tenderlyProvider = useTenderlyProvider()

  const encodedTransaction = useMemo(
    () => ({
      ...encodeSingle(transaction),
      operation: isDelegateCall ? 1 : 0,
    }),
    [transaction, isDelegateCall]
  )

  const translationAvailable = !!useApplicableTranslation(encodedTransaction)

  useEffect(() => {
    let canceled = false

    simulateRolesTransaction(
      encodedTransaction,
      connection,
      tenderlyProvider
    ).then((error) => {
      if (!canceled) setError(error)
    })

    return () => {
      canceled = true
    }
  }, [encodedTransaction, connection, tenderlyProvider])

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
