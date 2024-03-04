import { Web3Provider } from '@ethersproject/providers'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { useEffect, useState } from 'react'

import { wrapRequest } from '../providers/WrappingProvider'
import { Connection, Eip1193Provider, JsonRpcError } from '../types'
import {
  decodeGenericError,
  decodeRoleKey,
  decodeRolesV1Error,
  decodeRolesV2Error,
} from '../utils'
import { isSmartContractAddress, validateAddress } from '../utils'

import { useConnection } from './connectionHooks'

const useConnectionDryRun = (connection: Connection) => {
  const [error, setError] = useState<string | null>(null)
  const { provider, connected } = useConnection(connection.id)

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
      dryRun(provider, connection)
        .then(() => {
          console.log('dry run success')
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
  }, [connection, provider, connected])

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

async function dryRun(provider: Eip1193Provider, connection: Connection) {
  if (connection.pilotAddress && !validateAddress(connection.pilotAddress)) {
    return Promise.reject('Pilot Account: Invalid address')
  }
  if (!validateAddress(connection.moduleAddress)) {
    return Promise.reject('Module Address: Invalid address')
  }
  if (!validateAddress(connection.avatarAddress)) {
    return Promise.reject('Avatar: Invalid address')
  }

  const ethersProvider = new Web3Provider(provider)

  if (
    !(await isSmartContractAddress(connection.moduleAddress, ethersProvider))
  ) {
    return Promise.reject('Module Address: Not a smart contract')
  }
  if (
    !(await isSmartContractAddress(connection.avatarAddress, ethersProvider))
  ) {
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

  await provider.request({
    method: 'eth_estimateGas',
    params: [request],
  })
}

export default useConnectionDryRun
