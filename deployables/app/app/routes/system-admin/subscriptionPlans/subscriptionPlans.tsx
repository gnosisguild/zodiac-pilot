import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import {
  dbClient,
  getSubscriptionPlans,
  setDefaultSubscriptionPlan,
} from '@zodiac/db'
import { getUUID } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import {
  DateValue,
  GhostButton,
  InlineForm,
  SecondaryLinkButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from '@zodiac/ui'
import { Star } from 'lucide-react'
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

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ request }) => {
      const data = await request.formData()
      const subscriptionPlanId = getUUID(data, 'subscriptionPlanId')

      await setDefaultSubscriptionPlan(dbClient(), subscriptionPlanId)

      return null
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
            <TableRow withActions>
              <TableHeader>Name</TableHeader>
              <TableHeader>Created</TableHeader>
            </TableRow>
          </TableHead>

          <TableBody>
            {subscriptionPlans.map((subscriptionPlan) => (
              <TableRow key={subscriptionPlan.id}>
                <TableCell aria-describedby={subscriptionPlan.id}>
                  <div className="flex gap-2">
                    {subscriptionPlan.name}

                    {subscriptionPlan.isDefault && (
                      <Tag id={subscriptionPlan.id} color="green">
                        Default
                      </Tag>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DateValue>{subscriptionPlan.createdAt}</DateValue>
                </TableCell>
                <TableCell>
                  <MakeDefault
                    subscriptionPlanId={subscriptionPlan.id}
                    disabled={subscriptionPlan.isDefault}
                  />
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

const MakeDefault = ({
  subscriptionPlanId,
  disabled,
}: {
  subscriptionPlanId: string
  disabled: boolean
}) => (
  <InlineForm context={{ subscriptionPlanId }}>
    <GhostButton
      submit
      iconOnly
      icon={Star}
      size="tiny"
      intent={Intent.MakeDefault}
      disabled={disabled}
      busy={useIsPending(
        Intent.MakeDefault,
        (data) => data.get('subscriptionPlanId') === subscriptionPlanId,
      )}
    >
      Make default
    </GhostButton>
  </InlineForm>
)

enum Intent {
  MakeDefault = 'MakeDefault',
}
