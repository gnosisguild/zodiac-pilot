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
  Tag,
} from '@zodiac/ui'
import { Pencil, Plus } from 'lucide-react'
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
  loaderData: { workspaces },
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
                <div className="flex justify-between gap-2">
                  {workspace.label}

                  {workspace.id === workspaceId && (
                    <Tag color="green">Current</Tag>
                  )}
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
                <div className="flex justify-end gap-1 transition-opacity group-hover:opacity-100">
                  <MeatballMenu size="tiny" label="Workspace options">
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
                  </MeatballMenu>
                </div>
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
