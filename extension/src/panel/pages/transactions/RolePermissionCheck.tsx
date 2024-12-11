import { CopyToClipboard, Tag } from '@/components'
import { useExecutionRoute } from '@/execution-routes'
import { useProvider } from '@/providers-ui'
import type { TransactionState } from '@/state'
import { useApplicableTranslation } from '@/transaction-translation'
import type { Eip1193Provider, ExecutionRoute, JsonRpcError } from '@/types'
import {
  decodeGenericError,
  decodeRolesV1Error,
  decodeRolesV2Error,
} from '@/utils'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { toQuantity, ZeroAddress } from 'ethers'
import { Check, TriangleAlert, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  ExecutionActionType,
  parsePrefixedAddress,
  planExecution,
  type Route as SerRoute,
} from 'ser-kit'
import { Translate } from './Translate'

const simulateRolesTransaction = async (
  encodedTransaction: MetaTransactionData,
  route: ExecutionRoute,
  provider: Eip1193Provider,
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

  const from = parsePrefixedAddress(plan[0].from)
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

type Props = {
  transactionState: TransactionState
  mini?: boolean
}

export const RolePermissionCheck = ({
  transactionState,
  mini = false,
}: Props) => {
  const [error, setError] = useState<string | undefined | false>(undefined)
  const route = useExecutionRoute()
  const provider = useProvider()

  const translationAvailable = !!useApplicableTranslation(transactionState.id)

  useEffect(() => {
    let canceled = false
    if (!provider) return

    simulateRolesTransaction(
      transactionState.transaction,
      route,
      provider,
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
          <Tag head={<UsersRound size={16} />} color="success"></Tag>
        ) : (
          <Tag head={<UsersRound size={16} />} color="danger"></Tag>
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        Role permissions
        <div className="flex gap-2">
          {error === false ? (
            <Tag head={<Check size={16} />} color="success">
              Allowed
            </Tag>
          ) : (
            <Tag head={<TriangleAlert size={16} />} color="danger">
              {error}
            </Tag>
          )}

          {error && (
            <>
              {translationAvailable ? (
                <Translate transactionId={transactionState.id} />
              ) : (
                <CopyToClipboard
                  iconOnly
                  size="small"
                  data={transactionState.transaction}
                >
                  Copy transaction data to the clipboard
                </CopyToClipboard>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

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
