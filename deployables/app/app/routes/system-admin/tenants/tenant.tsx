import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import {
  activateFeatures,
  dbClient,
  deactivateFeatures,
  getActiveFeatures,
  getFeatures,
  getSubscriptionPlansForTenant,
  getTenant,
} from '@zodiac/db'
import { getBoolean, getMap } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import {
  Checkbox,
  DateValue,
  Form,
  SecondaryButton,
  SecondaryLinkButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'
import { href, Outlet } from 'react-router'
import type { Route } from './+types/tenant'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { tenantId } }) => {
      invariantResponse(isUUID(tenantId), 'tenant id is not a UUID')

      return {
        tenant: await getTenant(dbClient(), tenantId),
        features: await getFeatures(dbClient()),
        subscriptionPlans: await getSubscriptionPlansForTenant(
          dbClient(),
          tenantId,
        ),
        activeFeatures: (await getActiveFeatures(dbClient(), tenantId)).map(
          ({ id }) => id,
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

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ request, params: { tenantId } }) => {
      const data = await request.formData()

      invariantResponse(isUUID(tenantId), 'Tenant ID is not a UUID')

      const features = await getFeatures(dbClient())
      const featureStatus = getMap(data, 'feature', { getValue: getBoolean })

      const featuresToActivate = features.filter(
        (feature) => featureStatus[feature.id],
      )

      await activateFeatures(dbClient(), {
        tenantId,
        featureIds: featuresToActivate.map(({ id }) => id),
      })

      const featuresToDeactivate = features.filter(
        (feature) => !featuresToActivate.includes(feature),
      )

      await deactivateFeatures(dbClient(), {
        tenantId,
        featureIds: featuresToDeactivate.map(({ id }) => id),
      })
    },
    {
      ensureSignedIn: true,
      hasAccess({ isSystemAdmin }) {
        return isSystemAdmin
      },
    },
  )

const Tenant = ({
  loaderData: { tenant, features, activeFeatures, subscriptionPlans },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>{tenant.name}</Page.Header>

      <Page.Main>
        <div className="grid grid-cols-6 gap-8">
          <div className="col-span-2">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Valid from</TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {subscriptionPlans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No plans are active for this tenant
                    </TableCell>
                  </TableRow>
                )}

                {subscriptionPlans.map(({ validFrom, subscriptionPlan }) => (
                  <TableRow key={subscriptionPlan.id}>
                    <TableCell>{subscriptionPlan.name}</TableCell>
                    <TableCell>
                      <DateValue>{validFrom}</DateValue>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end">
              <SecondaryLinkButton
                to={href('/system-admin/tenant/:tenantId/add-plan', {
                  tenantId: tenant.id,
                })}
              >
                Add plan
              </SecondaryLinkButton>
            </div>
          </div>

          <div className="col-start-5">
            <Form>
              <h2 className="font-semibold">Features</h2>

              {features.map((feature) => (
                <Checkbox
                  key={feature.id}
                  name={`feature[${feature.id}]`}
                  defaultChecked={activeFeatures.includes(feature.id)}
                >
                  {feature.name}
                </Checkbox>
              ))}

              <Form.Actions>
                <SecondaryButton
                  intent={Intent.UpdateFeatures}
                  submit
                  busy={useIsPending(Intent.UpdateFeatures)}
                >
                  Save features
                </SecondaryButton>
              </Form.Actions>
            </Form>
          </div>
        </div>
      </Page.Main>

      <Outlet />
    </Page>
  )
}

export default Tenant

enum Intent {
  UpdateFeatures = 'UpdateFeatures',
}
