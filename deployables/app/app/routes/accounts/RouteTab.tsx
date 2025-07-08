import { ConfirmableAction } from '@/components'
import { useWorkspaceId } from '@/workspaces'
import type { Route } from '@zodiac/db/schema'
import { useIsPending } from '@zodiac/hooks'
import { GhostLinkButton, MeatballMenu, Popover, TabBar } from '@zodiac/ui'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { href } from 'react-router'
import { Intent } from './intents'

type RouteTabProps = {
  route: Route
  isDefault: boolean
}

export const RouteTab = ({ route, isDefault }: RouteTabProps) => {
  const [, setConfirmDelete] = useState(false)

  return (
    <TabBar.LinkTab
      aria-labelledby={route.id}
      to={href('/workspace/:workspaceId/accounts/:accountId/route/:routeId', {
        accountId: route.toId,
        routeId: route.id,
        workspaceId: useWorkspaceId(),
      })}
    >
      {isDefault && (
        <Popover popover={<span className="text-sm">Default route</span>}>
          <div className="size-2 rounded-full bg-teal-500 dark:bg-indigo-500" />
        </Popover>
      )}

      <span id={route.id}>{route.label || 'Unnamed route'}</span>

      <MeatballMenu label="Route options" size="tiny">
        <GhostLinkButton
          size="tiny"
          align="left"
          to={href(
            '/workspace/:workspaceId/accounts/:accountId/route/:routeId/edit',
            {
              workspaceId: useWorkspaceId(),
              accountId: route.toId,
              routeId: route.id,
            },
          )}
          icon={Pencil}
        >
          Edit
        </GhostLinkButton>

        <ConfirmableAction
          title="Remove route"
          description="Are you sure you want to remove this route? This action cannot be undone."
          intent={Intent.RemoveRoute}
          busy={useIsPending(Intent.RemoveRoute)}
          onConfirmChange={setConfirmDelete}
          context={{ routeId: route.id }}
          style="critical"
        >
          Remove
        </ConfirmableAction>
      </MeatballMenu>
    </TabBar.LinkTab>
  )
}
