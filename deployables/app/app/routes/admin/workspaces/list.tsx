import { authorizedLoader } from '@/auth-server'
import { useWorkspaceId } from '@/workspaces'
import { dbClient, getWorkspaces } from '@zodiac/db'
import {
  DateValue,
  GhostLinkButton,
  MeatballMenu,
  SecondaryLinkButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowActions,
  Tag,
} from '@zodiac/ui'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { href, Outlet } from 'react-router'
import type { Route } from './+types/list'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
    }) => {
      return {
        defaultWorkspaceId: tenant.defaultWorkspaceId,
        workspaces: await getWorkspaces(dbClient(), { tenantId: tenant.id }),
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ role }) {
        return role === 'admin'
      },
    },
  )

const Workspaces = ({
  loaderData: { workspaces, defaultWorkspaceId },
  params: { workspaceId },
}: Route.ComponentProps) => {
  return (
    <>
      <div className="flex justify-end">
        <SecondaryLinkButton
          icon={Plus}
          size="small"
          to={href('/workspace/:workspaceId/admin/workspaces/add', {
            workspaceId: useWorkspaceId(),
          })}
        >
          Add new workspace
        </SecondaryLinkButton>
      </div>

      <Table>
        <TableHead>
          <TableRow withActions>
            <TableHeader>Name</TableHeader>
            <TableHeader>Created</TableHeader>
            <TableHeader>Created by</TableHeader>
            <TableHeader>Last updated</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {workspaces.map((workspace) => (
            <TableRow key={workspace.id}>
              <TableCell>
                <div className="flex justify-between gap-2" id={workspace.id}>
                  {workspace.label}

                  <div aria-hidden className="flex gap-2">
                    {workspace.id === defaultWorkspaceId && (
                      <Tag color="green">Default</Tag>
                    )}

                    {workspace.id === workspaceId && (
                      <Tag color="blue">Current</Tag>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <DateValue>{workspace.createdAt}</DateValue>
              </TableCell>
              <TableCell>{workspace.createdBy.fullName}</TableCell>
              <TableCell>
                <DateValue>{workspace.updatedAt}</DateValue>
              </TableCell>
              <TableCell>
                <TableRowActions>
                  <MeatballMenu
                    size="tiny"
                    label="Workspace options"
                    descriptionId={workspace.id}
                  >
                    <GhostLinkButton
                      size="tiny"
                      icon={Pencil}
                      align="left"
                      to={href(
                        '/workspace/:workspaceId/admin/workspaces/edit/:id',
                        { workspaceId, id: workspace.id },
                      )}
                    >
                      Edit
                    </GhostLinkButton>

                    <GhostLinkButton
                      size="tiny"
                      icon={Trash2}
                      align="left"
                      style="critical"
                      to={href(
                        '/workspace/:workspaceId/admin/workspaces/remove/:id',
                        { workspaceId, id: workspace.id },
                      )}
                    >
                      Remove
                    </GhostLinkButton>
                  </MeatballMenu>
                </TableRowActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Outlet />
    </>
  )
}

export default Workspaces
