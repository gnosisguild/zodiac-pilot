import { ContractFactories, KnownContracts } from '@gnosis.pm/zodiac'
import { JsonRpcError } from '../types'

const RolesV1Interface =
  ContractFactories[KnownContracts.ROLES_V1].createInterface()
const RolesV1PermissionsInterface =
  ContractFactories[KnownContracts.PERMISSIONS].createInterface()
const RolesV2Interface =
  ContractFactories[KnownContracts.ROLES_V2].createInterface()

export function getRevertData(error: JsonRpcError) {
  // The errors thrown when a transaction is reverted use different formats, depending on:
  //  - wallet (MetaMask vs. WalletConnect)
  //  - RPC provider (Infura vs. Alchemy)
  //  - client library (ethers vs. directly using the EIP-1193 provider)

  // Here we try to fix the revert reason in any of the possible formats
  const message =
    error.data?.originalError?.data ||
    error.data?.data ||
    error.data?.originalError?.message ||
    error.data?.message ||
    error.message

  const prefix = 'Reverted 0x'
  return message.startsWith(prefix)
    ? message.substring(prefix.length - 2)
    : message
}

export function decodeGenericError(error: JsonRpcError) {
  const revertData = getRevertData(error)
  if (revertData.startsWith('0x')) {
    return asciiDecode(revertData.substring(2))
  }
  return revertData
}

export function decodeRolesV1Error(error: JsonRpcError) {
  const revertData = getRevertData(error)
  if (revertData.startsWith('0x')) {
    const rolesError = Object.values(RolesV1Interface.errors).find((err) =>
      revertData.startsWith(RolesV1Interface.getSighash(err))
    )
    const permissionsError = Object.values(
      RolesV1PermissionsInterface.errors
    ).find((err) =>
      revertData.startsWith(RolesV1PermissionsInterface.getSighash(err))
    )

    if (rolesError) {
      return {
        signature: rolesError.format('sighash'),
        message: rolesError.format('sighash'),
        data: RolesV1Interface.decodeErrorResult(rolesError, revertData),
      }
    }
    if (permissionsError) {
      return {
        signature: permissionsError.format('sighash'),
        message: permissionsError.format('sighash'),
        data: RolesV1PermissionsInterface.decodeErrorResult(
          permissionsError,
          revertData
        ),
      }
    }
  }
}

export function decodeRolesV2Error(error: JsonRpcError) {
  const revertData = getRevertData(error)

  if (revertData.startsWith('0x')) {
    const rolesError = Object.values(RolesV2Interface.errors).find((err) =>
      revertData.startsWith(RolesV2Interface.getSighash(err))
    )

    if (rolesError) {
      return {
        signature: rolesError.format('sighash'),
        message: rolesError.format('sighash'), // TODO use data to generate a more user-friendly message
        data: RolesV2Interface.decodeErrorResult(rolesError, revertData),
      }
    }
  }
}

const PERMISSION_ERRORS = Object.keys(RolesV1Interface.errors)
  .concat(Object.keys(RolesV1PermissionsInterface.errors))
  .concat(Object.keys(RolesV2Interface.errors))
export const isPermissionsError = (errorSignature: string) =>
  PERMISSION_ERRORS.includes(errorSignature) &&
  errorSignature !== 'ModuleTransactionFailed()'

function asciiDecode(hex: string) {
  let result = ''
  for (let i = 0; i < hex.length; i += 2) {
    result += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16))
  }
  return result
}
