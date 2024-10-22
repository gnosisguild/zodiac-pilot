import { Flex, Tag } from '@/components'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { toQuantity, ZeroAddress } from 'ethers'
import React, { useEffect, useState } from 'react'
import { RiGroupLine } from 'react-icons/ri'
import {
  ExecutionActionType,
  parsePrefixedAddress,
  planExecution,
  Route as SerRoute,
} from 'ser-kit'
import { Eip1193Provider, JsonRpcError, Route } from '../../types'
import { useProvider } from '../providers/ProvideProvider'
import { useRoute } from '../routes'
import { TransactionState } from '../state'
import { useApplicableTranslation } from '../transactionTranslations'
import { decodeRolesV1Error } from '../utils'
import { decodeGenericError, decodeRolesV2Error } from '../utils/decodeError'
import CopyToClipboard from './CopyToClipboard'
import { Translate } from './Translate'
import classes from './style.module.css'

const simulateRolesTransaction = async (
  encodedTransaction: MetaTransactionData,
  route: Route,
  provider: Eip1193Provider
) => {
  const routeWithInitiator = (
    route.initiator ? route : { ...route, initiator: ZeroAddress }
  ) as SerRoute
  const plan = await planExecution([encodedTransaction], routeWithInitiator)

  // TODO generalize permission checking logic (ser-kit)
  if (plan.length > 1) {
    throw new Error('Multi-step execution not yet supported')
  }

  if (plan[0]?.type !== ExecutionActionType.EXECUTE_TRANSACTION) {
    throw new Error('Only transaction execution is currently supported')
  }

  const [, from] = parsePrefixedAddress(plan[0].from)
  const tx = {
    ...plan[0].transaction,
    from,
    value: toQuantity(BigInt(plan[0].transaction.value || 0)),
  }

  try {
    await provider.request({
      method: 'eth_estimateGas',
      params: [tx],
    })
  } catch (e) {
    const decodedError =
      decodeRolesV1Error(e as JsonRpcError) ||
      decodeRolesV2Error(e as JsonRpcError)

    if (decodedError) {
      if (decodedError.name === 'ModuleTransactionFailed') {
        return false
      }

      if (decodedError.name === 'ConditionViolation') {
        return RolesV2Status[decodedError.args.status]
      }
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
  const provider = useProvider()

  const translationAvailable = !!useApplicableTranslation(index)

  useEffect(() => {
    let canceled = false
    if (!provider) return

    simulateRolesTransaction(
      transactionState.transaction,
      route,
      provider
    ).then((error) => {
      if (!canceled) setError(error)
    })

    return () => {
      canceled = true
    }
  }, [transactionState, route, provider])

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

enum RolesV2Status {
  Ok,
  /** Role not allowed to delegate call to target address */
  DelegateCallNotAllowed,
  /** Role not allowed to call target address */
  TargetAddressNotAllowed,
  /** Role not allowed to call this function on target address */
  FunctionNotAllowed,
  /** Role not allowed to send to target address */
  SendNotAllowed,
  /** Or condition not met */
  OrViolation,
  /** Nor condition not met */
  NorViolation,
  /** Parameter value is not equal to allowed */
  ParameterNotAllowed,
  /** Parameter value less than allowed */
  ParameterLessThanAllowed,
  /** Parameter value greater than maximum allowed by role */
  ParameterGreaterThanAllowed,
  /** Parameter value does not match */
  ParameterNotAMatch,
  /** Array elements do not meet allowed criteria for every element */
  NotEveryArrayElementPasses,
  /** Array elements do not meet allowed criteria for at least one element */
  NoArrayElementPasses,
  /** Parameter value not a subset of allowed */
  ParameterNotSubsetOfAllowed,
  /** Bitmask exceeded value length */
  BitmaskOverflow,
  /** Bitmask not an allowed value */
  BitmaskNotAllowed,
  CustomConditionViolation,
  AllowanceExceeded,
  CallAllowanceExceeded,
  EtherAllowanceExceeded,
}
