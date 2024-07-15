import React from 'react'
import { useEffect, useState } from 'react'
import { RiGroupLine } from 'react-icons/ri'

import { Flex, Tag } from '../../components'
import { useApplicableTranslation } from '../../transactionTranslations'
import { LegacyConnection, JsonRpcError } from '../../types'
import { decodeRolesV1Error } from '../../utils'
import {
  decodeGenericError,
  decodeRolesV2Error,
  isPermissionsError,
} from '../../utils/decodeError'

import CopyToClipboard from './CopyToClipboard'
import { Translate } from './Translate'
import classes from './style.module.css'
import { useRoute } from '../../routes'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { wrapRequest } from '../../providers/WrappingProvider'
import { useTenderlyProvider } from '../../providers'
import { TenderlyProvider } from '../../providers/ProvideTenderly'
import { TransactionState } from '../../state'
import { asLegacyConnection } from '../../routes/legacyConnectionMigrations'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

const simulateRolesTransaction = async (
  encodedTransaction: MetaTransactionData,
  connection: LegacyConnection,
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

    if (decodedError) {
      return isPermissionsError(decodedError.signature)
        ? decodedError.signature
        : false
    } else {
      const genericError = decodeGenericError(e as JsonRpcError)
      if (genericError === 'Module not authorized') {
        return 'Not a member of any role'
      }
    }
  }

  return false
}

const RolePermissionCheck: React.FC<{
  transactionState: TransactionState
  index: number
  mini?: boolean
}> = ({ transactionState, index, mini = false }) => {
  const [error, setError] = useState<string | undefined | false>(undefined)
  const { route } = useRoute()
  const tenderlyProvider = useTenderlyProvider()

  const translationAvailable = !!useApplicableTranslation(
    transactionState.transaction
  )

  useEffect(() => {
    let canceled = false

    simulateRolesTransaction(
      transactionState.transaction,
      asLegacyConnection(route),
      tenderlyProvider
    ).then((error) => {
      if (!canceled) setError(error)
    })

    return () => {
      canceled = true
    }
  }, [transactionState, route, tenderlyProvider])

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
            transactionState={transactionState}
            index={index}
            labeled
          />
        )}
        {error && !translationAvailable && (
          <CopyToClipboard transaction={transactionState.transaction} labeled />
        )}
      </Flex>
    </Flex>
  )
}

export default RolePermissionCheck
