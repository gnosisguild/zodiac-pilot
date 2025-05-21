import { authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { dbClient, getSubscriptionPlans } from '@zodiac/db'
import {
  DateValue,
  SecondaryLinkButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { href, Outlet } from 'react-router'
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
      <Page.Header
        action={
          <SecondaryLinkButton
            to={href('/system-admin/subscriptionPlans/create')}
          >
            Add new plan
          </SecondaryLinkButton>
        }
      >
        Plans
      </Page.Header>

      <Page.Main>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Created</TableHeader>
            </TableRow>
          </TableHead>

          <TableBody>
            {subscriptionPlans.map((subscriptionPlan) => (
              <TableRow key={subscriptionPlan.id}>
                <TableCell>{subscriptionPlan.name}</TableCell>
                <TableCell>
                  <DateValue>{subscriptionPlan.createdAt}</DateValue>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Page.Main>

      <Outlet />
    </Page>
  )
}

export default SubscriptionPlans
