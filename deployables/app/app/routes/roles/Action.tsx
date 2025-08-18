import { RoleAction, RoleActionAsset, RoleActionType } from '@zodiac/db/schema'
import { Card, DateValue, GhostLinkButton, Popover, Tag } from '@zodiac/ui'
import { ArrowRightLeft, FileQuestionMark, Pencil } from 'lucide-react'
import { PropsWithChildren } from 'react'
import { href } from 'react-router'
import { SwapAction } from './SwapAction'

type ActionProps = {
  action: RoleAction
  assets: RoleActionAsset[]
  createdBy: string
}

export const Action = ({ action, assets, createdBy }: ActionProps) => (
  <ActionLayout action={action} createdBy={createdBy}>
    {action.type === RoleActionType.Swapper && (
      <SwapAction action={action} assets={assets} />
    )}
  </ActionLayout>
)

type ActionLayoutProps = PropsWithChildren<{
  action: RoleAction
  createdBy: string
}>

const ActionLayout = ({ action, createdBy, children }: ActionLayoutProps) => (
  <Card
    titleId={action.id}
    title={
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Popover
            popover={<span className="text-xs uppercase">{action.type}</span>}
          >
            <Tag head={<ActionIcon type={action.type} />} />
          </Popover>

          <h2>
            <span id={action.id} className="font-semibold">
              {action.label}
            </span>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Created by{' '}
              <span className="text-zinc-600 dark:text-zinc-300">
                {createdBy}
              </span>{' '}
              on{' '}
              <span className="text-zinc-600 dark:text-zinc-300">
                <DateValue>{action.createdAt}</DateValue>
              </span>
            </div>
          </h2>
        </div>

        <GhostLinkButton
          iconOnly
          replace
          size="small"
          icon={Pencil}
          to={href('/workspace/:workspaceId/roles/:roleId/action/:actionId', {
            workspaceId: action.workspaceId,
            roleId: action.roleId,
            actionId: action.id,
          })}
        >
          Edit action
        </GhostLinkButton>
      </div>
    }
  >
    {children}
  </Card>
)

type ActionIconProps = { type: RoleActionType }

const ActionIcon = ({ type }: ActionIconProps) => {
  switch (type) {
    case RoleActionType.Swapper:
      return <ArrowRightLeft />

    default:
      return <FileQuestionMark />
  }
}
