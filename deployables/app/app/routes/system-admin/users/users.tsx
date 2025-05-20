import { authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { dbClient, getUsers } from '@zodiac/db'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import type { Route } from './+types/users'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async () => {
      return {
        users: await getUsers(dbClient()),
      }
    },
    {
      ensureSignedIn: true,
      hasAccess({ isSystemAdmin }) {
        return isSystemAdmin
      },
    },
  )

const Users = ({ loaderData: { users } }: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Users</Page.Header>

      <Page.Main>
        <Table
          bleed
          className="[--gutter:--spacing(8)] sm:[--gutter:--spacing(16)]"
        >
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Page.Main>
    </Page>
  )
}

export default Users
