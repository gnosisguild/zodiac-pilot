import { getChainId } from '@zodiac/chains'
import { ActionAssetTable, RoleAction } from '@zodiac/db/schema'
import { PrefixedAddress } from '@zodiac/schema'
import { unprefixAddress } from 'ser-kit'
import { DBClient } from '../../dbClient'

type CreateRoleActionAssetsOptions = {
  symbol: string
  address: PrefixedAddress
}

export const createRoleActionAssets = (
  db: DBClient,
  action: RoleAction,
  assets: CreateRoleActionAssetsOptions[],
) => {
  if (assets.length === 0) {
    return []
  }

  return db.insert(ActionAssetTable).values(
    assets.map(({ address, symbol }) => ({
      roleActionId: action.id,
      tenantId: action.tenantId,
      workspaceId: action.workspaceId,

      symbol,
      chainId: getChainId(address),
      address: unprefixAddress(address),
    })),
  )
}
