import { useExecutionRoute, useRouteConnect } from '@/execution-routes'
import { getReadOnlyProvider } from '@/providers'
import { JsonRpcError, LegacyConnection } from '@/types'
import {
  decodeGenericError,
  decodeRoleKey,
  decodeRolesV1Error,
  decodeRolesV2Error,
  isSmartContractAddress,
  validateAddress,
} from '@/utils'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { useEffect, useState } from 'react'
import { wrapRequest } from './wrapRequest'

export const useConnectionDryRun = (connection: LegacyConnection) => {
  const [error, setError] = useState<string | null>(null)
  const route = useExecutionRoute(connection.id)
  const [connected] = useRouteConnect(route)

  useEffect(() => {
    const { pilotAddress, avatarAddress, moduleAddress, moduleType, roleId } =
      connection

    const configurationComplete =
      moduleType === KnownContracts.DELAY || !!roleId

    if (
      connected &&
      pilotAddress &&
      avatarAddress &&
      moduleAddress &&
      configurationComplete
    ) {
      dryRun(connection)
        .then(() => {
          console.debug('dry run success')
          setError(null)
        })
        .catch((e: JsonRpcError) => {
          // For the Roles mod, we actually expect the dry run to fail with TargetAddressNotAllowed()
          // In case we see any other error, we try to help the user identify the problem.

          switch (moduleType) {
            case KnownContracts.ROLES_V1: {
              setError(handleRolesV1Error(e, roleId || '0'))
              return
            }
            case KnownContracts.ROLES_V2: {
              setError(handleRolesV2Error(e, roleId || '0'))
              return
            }
            default: {
              setError(decodeGenericError(e))
              console.warn('Unexpected dry run error', e)
            }
          }
        })
    }
  }, [connection, connected])

  return error
}

const handleRolesV1Error = (e: JsonRpcError, roleId: string) => {
  const rolesError = decodeRolesV1Error(e)
  if (rolesError) {
    switch (rolesError.signature) {
      case 'UnacceptableMultiSendOffset()':
        // we're calling to the zero address, so if this error happens it means our call was handled as a multi-send which happens
        // if the Role mod's multiSend address has not been initialized
        return "The Roles mod is not configured to accept multi-send calls. Use the contract's `setMultiSend` function to set the multi-send address."

      case 'TargetAddressNotAllowed()':
        // this is the expected error for a working Roles mod setup
        return null

      case 'NoMembership()':
        return `The Pilot account is not a member of role #${roleId}.`

      default:
    }
  }

  const decoded = decodeGenericError(e)
  console.warn('Unexpected Roles v1 error', e, decoded)
  return decoded || 'Unexpected error'
}

const handleRolesV2Error = (e: JsonRpcError, roleKey: string) => {
  const rolesError = decodeRolesV2Error(e)
  if (rolesError) {
    switch (rolesError.signature) {
      case 'NotAuthorized(address)':
        return 'The Pilot account must be enabled as a module of the modifier.'

      case 'ConditionViolation(uint8,bytes32)':
        // this is the expected error for a working Roles mod setup
        return null

      case 'NoMembership()':
        return `The Pilot account is not a member of role ${decodeRoleKey(
          roleKey
        )}.`

      default:
    }
  }

  const decoded = decodeGenericError(e)
  console.warn('Unexpected Roles v2 error', e, decoded)
  return decoded || 'Unexpected error'
}

async function dryRun(connection: LegacyConnection) {
  const provider = getReadOnlyProvider(connection.chainId)

  if (connection.pilotAddress && !validateAddress(connection.pilotAddress)) {
    return Promise.reject('Pilot Account: Invalid address')
  }
  if (!validateAddress(connection.moduleAddress)) {
    return Promise.reject('Module Address: Invalid address')
  }
  if (!validateAddress(connection.avatarAddress)) {
    return Promise.reject('Avatar: Invalid address')
  }

  if (!(await isSmartContractAddress(connection.moduleAddress, provider))) {
    return Promise.reject('Module Address: Not a smart contract')
  }
  if (!(await isSmartContractAddress(connection.avatarAddress, provider))) {
    return Promise.reject('Avatar: Not a smart contract')
  }

  const request = wrapRequest(
    {
      to: '0x0000000000000000000000000000000000000000',
      data: '0x00000000',
      from: connection.avatarAddress,
    },
    connection,
    false
  )

  // TODO enable this once we can query role members from ser
  // if (!request.from && connection.roleId) {
  //   // If pilotAddress is not yet determined, we will use a random member of the specified role
  //   request.from = await getRoleMember(connection)
  // }

  await provider.estimateGas(request)
}
