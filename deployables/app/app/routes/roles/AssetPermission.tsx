import { RoleActionAsset } from '@zodiac/db/schema'
import { Select } from '@zodiac/ui'
import { ComponentProps } from 'react'

export enum SellBuyPermission {
  Sell = 'Sell',
  Buy = 'Buy',
  SellAndBuy = 'SellAndBuy',
}

export const AssetPermission = (
  props: Omit<ComponentProps<typeof Select>, 'options'>,
) => (
  <Select
    defaultValue={{
      label: 'Sell & Buy',
      value: SellBuyPermission.SellAndBuy,
    }}
    {...props}
    options={[
      { label: 'Sell', value: SellBuyPermission.Sell },
      { label: 'Buy', value: SellBuyPermission.Buy },
      { label: 'Sell & Buy', value: SellBuyPermission.SellAndBuy },
    ]}
  />
)

export const getPermission = (asset: RoleActionAsset) => {
  if (asset.allowBuy && asset.allowSell) {
    return { label: 'Sell & Buy', value: SellBuyPermission.SellAndBuy }
  }

  if (asset.allowBuy) {
    return { label: 'Buy', value: SellBuyPermission.Buy }
  }

  return { label: 'Sell', value: SellBuyPermission.Sell }
}
