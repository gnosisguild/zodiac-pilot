import { authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { dbClient, getTenants } from '@zodiac/db'
import {
  DateValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { href, Link } from 'react-router'
import type { Route } from './+types/tenants'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async () => {
      return { tenants: await getTenants(dbClient()) }
    },
    {
      ensureSignedIn: true,
      hasAccess({ isSystemAdmin }) {
        return isSystemAdmin
      },
    },
  )

const Tenants = ({ loaderData: { tenants } }: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Tenants</Page.Header>

      <Page.Main>
        <Table
          bleed
          className="[--gutter:--spacing(8)] sm:[--gutter:--spacing(16)]"
        >
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Created</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  <Link
                    to={href('/system-admin/tenant/:tenantId', {
                      tenantId: tenant.id,
                    })}
                  >
                    {tenant.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <DateValue>{tenant.createdAt}</DateValue>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Page.Main>
    </Page>
  )
}

export default Tenants
