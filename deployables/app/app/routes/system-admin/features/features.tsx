import { authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { dbClient, getFeatures } from '@zodiac/db'
import {
  SecondaryLinkButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { href, Outlet } from 'react-router'
import type { Route } from './+types/features'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async () => {
      return { features: await getFeatures(dbClient()) }
    },
    {
      ensureSignedIn: true,
      hasAccess({ isSystemAdmin }) {
        return isSystemAdmin
      },
    },
  )

const Features = ({ loaderData: { features } }: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header
        action={
          <SecondaryLinkButton to={href('/system-admin/features/create')}>
            Create new feature
          </SecondaryLinkButton>
        }
      >
        Features
      </Page.Header>

      <Page.Main>
        <Table
          bleed
          className="[--gutter:--spacing(8)] sm:[--gutter:--spacing(16)]"
        >
          <TableHead>
            <TableRow>
              <TableHeader>Feature</TableHeader>
            </TableRow>
          </TableHead>

          <TableBody>
            {features.map((feature) => (
              <TableRow key={feature.id}>
                <TableCell>{feature.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Page.Main>

      <Outlet />
    </Page>
  )
}

export default Features
