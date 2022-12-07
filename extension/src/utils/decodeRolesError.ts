import { JsonRpcError } from '../types'
import { Permissions__factory, Roles__factory } from '../types/typechain'

const permissionsInterface = Permissions__factory.createInterface()
const rolesInterface = Roles__factory.createInterface()

const KNOWN_ERRORS = Object.keys(rolesInterface.errors).concat(
  Object.keys(permissionsInterface.errors)
)

// Error messages from smart contract calls look like this: "Reverted <HEX_CODE>"
// where <HEX_CODE> is either an ASCII string or an error sighash.
export default function decodeRolesError(error: JsonRpcError) {
  const message = error.data.data || error.data.message || error.message
  const prefix = 'Reverted 0x'
  const revertData = message.startsWith(prefix)
    ? message.substring(prefix.length - 2)
    : message

  if (revertData.startsWith('0x')) {
    const error =
      Object.keys(rolesInterface.errors).find(
        (errSig) => rolesInterface.getSighash(errSig) === revertData
      ) ||
      Object.keys(permissionsInterface.errors).find(
        (errSig) => permissionsInterface.getSighash(errSig) === revertData
      )
    if (error) return error

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
