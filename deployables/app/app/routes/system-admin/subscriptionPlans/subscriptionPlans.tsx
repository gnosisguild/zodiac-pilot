import { authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { dbClient, getSubscriptionPlans } from '@zodiac/db'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import type { Route } from './+types/subscriptionPlans'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async () => {
      return { subscriptionPlans: await getSubscriptionPlans(dbClient()) }
    },
    {
      ensureSignedIn: true,
      hasAccess({ isSystemAdmin }) {
        return isSystemAdmin
      },
    },
  )

const SubscriptionPlans = ({
  loaderData: { subscriptionPlans },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Subscription Plans</Page.Header>

      <Page.Main>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
            </TableRow>
          </TableHead>

          <TableBody>
            {subscriptionPlans.map((subscriptionPlan) => (
              <TableRow key={subscriptionPlan.id}>
                <TableCell>{subscriptionPlan.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Page.Main>
    </Page>
  )
}

export default SubscriptionPlans
