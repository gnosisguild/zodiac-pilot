import { invariant } from '@epic-web/invariant'
import { KnownContracts } from '@gnosis-guild/zodiac'
import { ZERO_ADDRESS } from '@zodiac/chains'
import { getRolesWaypoint } from '@zodiac/modules'
import type { ExecutionRoute, HexAddress } from '@zodiac/schema'
import { toQuantity } from 'ethers'
import {
  AccountType,
  unprefixAddress,
  type MetaTransactionRequest,
} from 'ser-kit'
import { getInterface } from './getInterface'
import { maybeGetRoleId } from './maybeGetRoleId'

type TransactionData = {
  to?: HexAddress
  value?: string
  data?: HexAddress
  from?: HexAddress
}

type WrapRequestOptions = {
  request: MetaTransactionRequest | TransactionData
  route: ExecutionRoute
  revertOnError?: boolean
}

export function wrapRequest({
  request,
  route,
  revertOnError = true,
}: WrapRequestOptions): TransactionData {
  const rolesWaypoint = getRolesWaypoint(route)

  invariant(
    rolesWaypoint != null,
    'No wrapping should be applied for direct execution',
  )

  let data: string
  switch (rolesWaypoint.account.type) {
    case AccountType.ROLES: {
      if (rolesWaypoint.account.version === 1) {
        data = getInterface(KnownContracts.ROLES_V1).encodeFunctionData(
          'execTransactionWithRole',
          [
            request.to || '',
            request.value || 0,
            request.data || '0x',
            ('operation' in request && request.operation) || 0,
            maybeGetRoleId(rolesWaypoint) ?? 0,
            revertOnError,
          ],
        )
      } else {
        data = getInterface(KnownContracts.ROLES_V2).encodeFunctionData(
          'execTransactionWithRole',
          [
            request.to || '',
            request.value || 0,
            request.data || '0x',
            ('operation' in request && request.operation) || 0,
            maybeGetRoleId(rolesWaypoint) ?? ZERO_ADDRESS,
            revertOnError,
          ],
        )
      }
      break
    }

    case AccountType.DELAY:
      data = getInterface(KnownContracts.DELAY).encodeFunctionData(
        'execTransactionFromModule',
        [
          request.to || '',
          request.value || 0,
          request.data || '0x',
          ('operation' in request && request.operation) || 0,
        ],
      )
      break
    default:
      throw new Error(`Unsupported module type: ${rolesWaypoint.account.type}`)
  }

  invariant(route.initiator != null, 'No pilot address specified for the route')

  return {
    from: unprefixAddress(route.initiator),
    to: rolesWaypoint.account.address,
    data: data as HexAddress,
    value: toQuantity(0n),
  }
}
