import { authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { getUsers as getWorkOsUsers } from '@/workOS/server'
import { dbClient, getUsers } from '@zodiac/db'
import {
  DateValue,
  Empty,
  GhostLinkButton,
  Section,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { Trash2 } from 'lucide-react'
import { href, Outlet } from 'react-router'
import type { Route } from './+types/users'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async () => {
      const users = await getUsers(dbClient())
      const externalUserIds = users.map(({ externalId }) => externalId)

      const workOsUsers = await getWorkOsUsers()

      return {
        users,
        workOsUsers: workOsUsers.filter(
          (user) => !externalUserIds.includes(user.id),
        ),
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
        <Section
          title="WorkOS Users"
          description="These users exist in Work OS but not in our system"
        >
          {workOsUsers.length > 0 && (
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
                  <TableHeader className="relative w-0">
                    <span className="sr-only">Actions</span>
                  </TableHeader>
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
                    <TableCell>
                      <GhostLinkButton
                        iconOnly
                        icon={Trash2}
                        size="tiny"
                        style="critical"
                        to={href('/system-admin/users/remove/:workOsUserId', {
                          workOsUserId: user.id,
                        })}
                      >
                        Remove
                      </GhostLinkButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Section>

        <Section title="Zodiac OS Users">
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
        </Section>
      </Page.Main>

      <Outlet />
    </Page>
  )
}

export default Users
