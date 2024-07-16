import React from 'react'
import { useEffect, useState } from 'react'
import { RiGroupLine } from 'react-icons/ri'

import { Flex, Tag } from '../../components'
import { useApplicableTranslation } from '../../transactionTranslations'
import { JsonRpcError, Route } from '../../types'
import { decodeRolesV1Error } from '../../utils'
import { decodeGenericError, decodeRolesV2Error } from '../../utils/decodeError'

import CopyToClipboard from './CopyToClipboard'
import { Translate } from './Translate'
import classes from './style.module.css'
import { useRoute } from '../../routes'
import { useTenderlyProvider } from '../../providers'
import { TenderlyProvider } from '../../providers/ProvideTenderly'
import { TransactionState } from '../../state'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { ZeroAddress } from 'ethers'
import {
  ExecutionActionType,
  parsePrefixedAddress,
  planExecution,
  Route as SerRoute,
} from 'ser-kit'

const simulateRolesTransaction = async (
  encodedTransaction: MetaTransactionData,
  route: Route,
  tenderlyProvider: TenderlyProvider
) => {
  const routeWithInitiator = (
    route.initiator ? route : { ...route, initiator: ZeroAddress }
  ) as SerRoute
  const plan = await planExecution([encodedTransaction], routeWithInitiator)

  if (plan.length > 1) {
    throw new Error('Multi-step execution not yet supported')
  }

  if (plan[0]?.type !== ExecutionActionType.EXECUTE_TRANSACTION) {
    throw new Error('Only transaction execution is currently supported')
  }

  const [, from] = parsePrefixedAddress(plan[0].from)
  const tx = { ...plan[0].transaction, from }

  try {
    await tenderlyProvider.request({
      method: 'eth_estimateGas',
      params: [tx],
    })
  } catch (e) {
    const decodedError =
      decodeRolesV1Error(e as JsonRpcError) ||
      decodeRolesV2Error(e as JsonRpcError)

    if (decodedError) {
      return decodedError.name
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
      route,
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
