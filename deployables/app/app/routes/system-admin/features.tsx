import { authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { dbClient, getFeatures } from '@zodiac/db'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
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
      <Page.Header>Features</Page.Header>

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
    </Page>
  )
}

export default Features
