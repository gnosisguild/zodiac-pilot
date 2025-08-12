import { getChainId } from '@zodiac/chains'
import { ActionAssetTable, RoleAction } from '@zodiac/db/schema'
import { AllowanceInterval, PrefixedAddress } from '@zodiac/schema'
import { unprefixAddress } from 'ser-kit'
import { DBClient } from '../../dbClient'

type AssetCreateInput = {
  symbol: string
  address: PrefixedAddress
}

type CreateAssetOptions = {
  sell: AssetCreateInput[]
  buy: AssetCreateInput[]
  allowance?: {
    allowance: bigint
    interval: AllowanceInterval
  }
}

export const createRoleActionAssets = (
  db: DBClient,
  action: RoleAction,
  { sell, buy, allowance }: CreateAssetOptions,
) => {
  if (sell.length === 0 && buy.length === 0) {
    return []
  }

  return db.insert(ActionAssetTable).values(
    [...sell, ...buy].map((asset) => ({
      roleActionId: action.id,
      roleId: action.roleId,
      tenantId: action.tenantId,
      workspaceId: action.workspaceId,

      allowSell: sell.includes(asset),
      allowBuy: buy.includes(asset),

      ...allowance,

      symbol: asset.symbol,
      chainId: getChainId(asset.address),
      address: unprefixAddress(asset.address),
    })),
  )
}
