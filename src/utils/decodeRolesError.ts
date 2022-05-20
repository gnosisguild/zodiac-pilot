import { Permissions__factory, Roles__factory } from '../types/typechain'

const permissionsInterface = Permissions__factory.createInterface()
const rolesInterface = Roles__factory.createInterface()

// Error messages from smart contract calls look like this: "Reverted <HEX_CODE>"
// where <HEX_CODE> is either an ASCII string or an error sighash.
export default function decodeError(message: string) {
  const prefix = 'Reverted 0x'
  if (message.startsWith(prefix)) {
    const reason = message.substring(prefix.length - 2)

    const error =
      Object.keys(rolesInterface.errors).find(
        (errSig) => rolesInterface.getSighash(errSig) === reason
      ) ||
      Object.keys(permissionsInterface.errors).find(
        (errSig) => permissionsInterface.getSighash(errSig) === reason
      )
    if (error) return error

    return asciiDecode(reason.substring(2))
  }

  return message
}

function asciiDecode(hex: string) {
  let result = ''
  for (let i = 0; i < hex.length; i += 2) {
    result += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16))
  }
  return result
}
