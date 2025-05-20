import { authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { getUsers as getWorkOsUsers } from '@/workOS/server'
import { dbClient, getUsers } from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
import {
  DateValue,
  Empty,
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
      const users = await getUsers(dbClient())
      const userIds = users.map(({ id }) => id)

      const workOsUsers = await getWorkOsUsers()

      return {
        users,
        workOsUsers: workOsUsers.filter((user) => {
          if (user.externalId == null) {
            return true
          }

          if (!isUUID(user.externalId)) {
            return true
          }

          return !userIds.includes(user.externalId)
        }),
      }
    },
    {
      ensureSignedIn: true,
      hasAccess({ isSystemAdmin }) {
        return isSystemAdmin
      },
    },
  )

const Users = ({
  loaderData: { users, workOsUsers },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Users</Page.Header>

      <Page.Main className="gap-8">
        {workOsUsers.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold">Work OS users</h2>
            <p className="mb-8 text-sm opacity-75">
              These users exist in Work OS but not in our system
            </p>

            <Table
              bleed
              className="[--gutter:--spacing(8)] sm:[--gutter:--spacing(16)]"
            >
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>ID</TableHeader>
                  <TableHeader>External ID</TableHeader>
                  <TableHeader>Created</TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {workOsUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || (
                        <Empty />
                      )}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {user.id}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {user.externalId}
                    </TableCell>
                    <TableCell>
                      <DateValue>{new Date(user.createdAt)}</DateValue>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold">Zodiac OS users</h2>
          <Table
            bleed
            className="[--gutter:--spacing(8)] sm:[--gutter:--spacing(16)]"
          >
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>ID</TableHeader>
                <TableHeader>Created</TableHeader>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName || <Empty />}</TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {user.id}
                  </TableCell>
                  <TableCell>
                    <DateValue>{user.createdAt}</DateValue>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </Page.Main>
    </Page>
  )
}

export default Users
