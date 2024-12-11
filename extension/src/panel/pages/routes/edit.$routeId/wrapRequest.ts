import type { HexAddress, LegacyConnection, TransactionData } from '@/types'
import { ContractFactories, KnownContracts } from '@gnosis.pm/zodiac'
import { toQuantity } from 'ethers'
import type { MetaTransactionRequest } from 'ser-kit'

const RolesV1Interface =
  ContractFactories[KnownContracts.ROLES_V1].createInterface()
const RolesV2Interface =
  ContractFactories[KnownContracts.ROLES_V2].createInterface()
const DelayInterface = ContractFactories[KnownContracts.DELAY].createInterface()

export function wrapRequest(
  request: MetaTransactionRequest | TransactionData,
  connection: LegacyConnection,
  revertOnError = true,
): TransactionData {
  if (!connection.moduleAddress) {
    throw new Error('No wrapping should be applied for direct execution')
  }

  let data: string
  switch (connection.moduleType) {
    case KnownContracts.ROLES_V1:
      data = RolesV1Interface.encodeFunctionData('execTransactionWithRole', [
        request.to || '',
        request.value || 0,
        request.data || '0x',
        ('operation' in request && request.operation) || 0,
        connection.roleId || 0,
        revertOnError,
      ])
      break
    case KnownContracts.ROLES_V2:
      data = RolesV2Interface.encodeFunctionData('execTransactionWithRole', [
        request.to || '',
        request.value || 0,
        request.data || '0x',
        ('operation' in request && request.operation) || 0,
        connection.roleId ||
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        revertOnError,
      ])
      break
    case KnownContracts.DELAY:
      data = DelayInterface.encodeFunctionData('execTransactionFromModule', [
        request.to || '',
        request.value || 0,
        request.data || '0x',
        ('operation' in request && request.operation) || 0,
      ])
      break
    default:
      throw new Error(`Unsupported module type: ${connection.moduleType}`)
  }

  return {
    from: connection.pilotAddress as HexAddress,
    to: connection.moduleAddress as HexAddress,
    data: data as HexAddress,
    value: toQuantity(0n),
  }
}
