import { useWorkspaceId } from '@/workspaces'
import type { Route } from '@zodiac/db/schema'
import { GhostLinkButton, MeatballMenu, Popover, TabBar } from '@zodiac/ui'
import { Pencil, Trash2 } from 'lucide-react'
import { href } from 'react-router'

type RouteTabProps = {
  route: Route
  isDefault: boolean
}

export const RouteTab = ({ route, isDefault }: RouteTabProps) => {
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
          replace
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

        <GhostLinkButton
          replace
          size="tiny"
          align="left"
          style="critical"
          icon={Trash2}
          to={href(
            '/workspace/:workspaceId/accounts/:accountId/route/:routeId/remove',
            {
              workspaceId: useWorkspaceId(),
              accountId: route.toId,
              routeId: route.id,
            },
          )}
        >
          Remove
        </GhostLinkButton>
      </MeatballMenu>
    </TabBar.LinkTab>
  )
}
