import { ContractFactories, KnownContracts } from '@gnosis.pm/zodiac'
import { JsonRpcError } from '../types'

const RolesV1Interface =
  ContractFactories[KnownContracts.ROLES_V1].createInterface()
const RolesV1PermissionsInterface =
  ContractFactories[KnownContracts.PERMISSIONS].createInterface()
const RolesV2Interface =
  ContractFactories[KnownContracts.ROLES_V2].createInterface()

const KNOWN_ERRORS = Object.keys(RolesV1Interface.errors)
  .concat(Object.keys(RolesV1PermissionsInterface.errors))
  .concat(Object.keys(RolesV2Interface.errors))

export default function decodeRolesError(error: JsonRpcError) {
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
  const revertData = message.startsWith(prefix)
    ? message.substring(prefix.length - 2)
    : message

  if (revertData.startsWith('0x')) {
    const rolesError =
      Object.keys(RolesV1Interface.errors).find(
        (errSig) => RolesV1Interface.getSighash(errSig) === revertData
      ) ||
      Object.keys(RolesV1PermissionsInterface.errors).find(
        (errSig) =>
          RolesV1PermissionsInterface.getSighash(errSig) === revertData
      ) ||
      Object.keys(RolesV2Interface.errors).find(
        (errSig) => RolesV2Interface.getSighash(errSig) === revertData
      )

    if (rolesError) return rolesError

    return asciiDecode(revertData.substring(2))
  }

  return message
}

export const isPermissionsError = (decodedError: string) =>
  KNOWN_ERRORS.includes(decodedError) &&
  decodedError !== 'ModuleTransactionFailed()'

function asciiDecode(hex: string) {
  let result = ''
  for (let i = 0; i < hex.length; i += 2) {
    result += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16))
  }
  return result
}
