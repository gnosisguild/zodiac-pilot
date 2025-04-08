import { decodeGenericError, decodeRolesV1Error } from './decodeError'
import type { JsonRpcError } from './JsonRpcError'

export const handleRolesV1Error = (e: JsonRpcError, roleId: string) => {
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
        return `The connected account is not a member of role #${roleId}.`

      default:
    }
  }

  const decoded = decodeGenericError(e)

  console.warn('Unexpected Roles v1 error', e, decoded)

  return decoded || 'Unexpected error'
}
