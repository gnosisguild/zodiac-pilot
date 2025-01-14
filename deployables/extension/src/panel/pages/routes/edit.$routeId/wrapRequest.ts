import type { HexAddress, LegacyConnection, TransactionData } from '@/types'
import { ContractFactories } from '@gnosis.pm/zodiac'
import { SupportedZodiacModuleType } from '@zodiac/modules'
import { toQuantity } from 'ethers'
import type { MetaTransactionRequest } from 'ser-kit'

const RolesV1Interface =
  ContractFactories[SupportedZodiacModuleType.ROLES_V1].createInterface()
const RolesV2Interface =
  ContractFactories[SupportedZodiacModuleType.ROLES_V2].createInterface()
const DelayInterface =
  ContractFactories[SupportedZodiacModuleType.DELAY].createInterface()

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
    case SupportedZodiacModuleType.ROLES_V1:
      data = RolesV1Interface.encodeFunctionData('execTransactionWithRole', [
        request.to || '',
        request.value || 0,
        request.data || '0x',
        ('operation' in request && request.operation) || 0,
        connection.roleId || 0,
        revertOnError,
      ])
      break
    case SupportedZodiacModuleType.ROLES_V2:
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
    case SupportedZodiacModuleType.DELAY:
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
