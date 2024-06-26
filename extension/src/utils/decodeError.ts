import { defaultAbiCoder } from '@ethersproject/abi'
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
  //  - RPC provider (Infura vs. Alchemy vs. Tenderly)
  //  - client library (ethers vs. directly using the EIP-1193 provider)

  // first, drill through potential error wrappings down to the original error
  while (typeof error === 'object' && (error as any).error) {
    error = (error as any).error
  }

  // Here we try to extract the revert reason in any of the possible formats
  const message =
    typeof error.data === 'string'
      ? error.data
      : error.data?.originalError?.data ||
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

  // Solidity `revert "reason string"` will revert with the data encoded as selector of `Error(string)` followed by the ABI encoded string param
  if (revertData.startsWith('0x08c379a0')) {
    try {
      const [reason] = defaultAbiCoder.decode(
        ['string'],
        '0x' + revertData.slice(10) // skip over selector
      )
      return reason as string
    } catch (e) {
      return revertData
    }
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
