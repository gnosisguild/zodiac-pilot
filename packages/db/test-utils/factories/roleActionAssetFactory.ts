import { Chain } from '@zodiac/chains'
import {
  ActionAssetTable,
  RoleAction,
  RoleActionAsset,
  RoleActionAssetCreateInput,
} from '@zodiac/db/schema'
import { randomAddress } from '@zodiac/test-utils'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const roleActionAssetFactory = createFactory<
  RoleActionAssetCreateInput,
  RoleActionAsset,
  [action: RoleAction]
>({
  build(action, data) {
    return {
      chainId: Chain.ETH,
      symbol: 'WETH',
      address: randomAddress(),
      roleActionId: action.id,
      tenantId: action.tenantId,
      workspaceId: action.workspaceId,
      allowBuy: true,
      allowSell: true,

      ...data,
    }
  },
  async create(db, data) {
    const [asset] = await db.insert(ActionAssetTable).values(data).returning()

    return asset
  },
  createWithoutDb(data) {
    return {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: null,
      allowance: null,
      interval: null,

      ...data,
    }
  },
})
