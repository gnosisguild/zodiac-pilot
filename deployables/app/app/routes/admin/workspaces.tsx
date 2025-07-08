import { authorizedLoader } from '@/auth-server'
import { dbClient, getWorkspaces } from '@zodiac/db'
import {
  DateValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import type { Route } from './+types/workspaces'

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

const Workspaces = ({ loaderData: { workspaces } }: Route.ComponentProps) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Created</TableHeader>
          <TableHeader>Created by</TableHeader>
          <TableHeader>Last updated</TableHeader>
        </TableRow>
      </TableHead>

      <TableBody>
        {workspaces.map((workspace) => (
          <TableRow key={workspace.id}>
            <TableCell>{workspace.label}</TableCell>
            <TableCell>
              <DateValue>{workspace.createdAt}</DateValue>
            </TableCell>
            <TableCell>{workspace.createdBy.fullName}</TableCell>
            <TableCell>
              <DateValue>{workspace.updatedAt}</DateValue>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default Workspaces
