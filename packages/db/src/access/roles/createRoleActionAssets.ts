import { getChainId } from '@zodiac/chains'
import { ActionAssetTable, RoleAction } from '@zodiac/db/schema'
import { AllowanceInterval, PrefixedAddress } from '@zodiac/schema'
import { unprefixAddress } from 'ser-kit'
import { DBClient } from '../../dbClient'

type CreateRoleActionAssetsOptions = {
  symbol: string
  address: PrefixedAddress
}

type GeneraleCreateAssetOptions = {
  allowSell: boolean
  allowBuy: boolean
  allowance?: {
    allowance: bigint
    interval: AllowanceInterval
  }
}

export const createRoleActionAssets = (
  db: DBClient,
  action: RoleAction,
  { allowance, allowBuy, allowSell }: GeneraleCreateAssetOptions,
  assets: CreateRoleActionAssetsOptions[],
) => {
  if (assets.length === 0) {
    return []
  }

  return db.insert(ActionAssetTable).values(
    assets.map(({ address, symbol }) => ({
      roleActionId: action.id,
      roleId: action.roleId,
      tenantId: action.tenantId,
      workspaceId: action.workspaceId,

      allowSell,
      allowBuy,

      ...allowance,

      symbol,
      chainId: getChainId(address),
      address: unprefixAddress(address),
    })),
  )
}
