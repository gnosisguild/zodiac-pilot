import { Token } from '@/components'
import { RoleAction, RoleActionAsset } from '@zodiac/db/schema'
import {
  GhostLinkButton,
  Info,
  NumberValue,
  SecondaryLinkButton,
} from '@zodiac/ui'
import classNames from 'classnames'
import { ArrowRight, HandCoins } from 'lucide-react'
import { href } from 'react-router'
import { prefixAddress } from 'ser-kit'

type SwapActionProps = {
  action: RoleAction
  assets: RoleActionAsset[]
}

export const SwapAction = ({ action, assets }: SwapActionProps) => {
  if (assets.length === 0) {
    return (
      <Info>
        No assets have been configured for this swap
        <Info.Actions>
          <SecondaryLinkButton
            size="small"
            to={href('/workspace/:workspaceId/roles/:roleId/action/:actionId', {
              workspaceId: action.workspaceId,
              roleId: action.roleId,
              actionId: action.id,
            })}
          >
            Configure swap
          </SecondaryLinkButton>
        </Info.Actions>
      </Info>
    )
  }

  return (
    <div className="grid grid-cols-9 items-center gap-4">
      <div className="col-span-4 flex flex-col divide-y divide-zinc-300 rounded bg-zinc-100 dark:divide-zinc-700 dark:bg-zinc-800">
        {assets
          .filter((asset) => asset.allowSell)
          .map((asset) => (
            <Asset key={asset.id} asset={asset} context="sell" />
          ))}
      </div>

      <div className="flex justify-center">
        <ArrowRight className="size-4" />
      </div>

      <div className="col-span-4 flex flex-col divide-y divide-zinc-300 rounded bg-zinc-100 dark:divide-zinc-700 dark:bg-zinc-800">
        {assets
          .filter((asset) => asset.allowBuy)
          .map((asset) => (
            <Asset key={asset.id} asset={asset} context="buy" />
          ))}
      </div>
    </div>
  )
}

const Asset = ({
  asset,
  context,
}: {
  asset: RoleActionAsset
  context: 'sell' | 'buy'
}) => (
  <div className="group flex items-center justify-between py-2 pl-4 pr-2">
    <div className="flex flex-col gap-1">
      <Token contractAddress={prefixAddress(asset.chainId, asset.address)}>
        {asset.symbol}

        {asset.allowance && asset.interval && (
          <div className="flex gap-1 text-xs opacity-75">
            {context}
            <NumberValue>{asset.allowance}</NumberValue>
            {asset.interval}
          </div>
        )}
      </Token>
    </div>

    <div
      className={classNames(
        'transition-opacity',
        asset.allowance == null && 'opacity-0 group-hover:opacity-100',
      )}
    >
      <GhostLinkButton
        iconOnly
        icon={HandCoins}
        size="tiny"
        to={href(
          '/workspace/:workspaceId/roles/:roleId/action/:actionId/asset/:assetId',
          {
            workspaceId: asset.workspaceId,
            roleId: asset.roleId,
            actionId: asset.roleActionId,
            assetId: asset.id,
          },
        )}
      >
        Edit allowance
      </GhostLinkButton>
    </div>
  </div>
)
