import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import {
  activateFeature,
  dbClient,
  deactivateFeature,
  getActiveFeatures,
  getFeatures,
  getTenant,
} from '@zodiac/db'
import { getBoolean, getMap } from '@zodiac/form-data'
import { isUUID } from '@zodiac/schema'
import { Checkbox, Form, SecondaryButton } from '@zodiac/ui'
import type { Route } from './+types/tenant'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { tenantId } }) => {
      invariantResponse(isUUID(tenantId), 'tenant id is not a UUID')

      return {
        tenant: await getTenant(dbClient(), tenantId),
        features: await getFeatures(dbClient()),
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

      for (const feature of featuresToActivate) {
        await activateFeature(dbClient(), { tenantId, featureId: feature.id })
      }

      const featuresToDeactivate = features.filter(
        (feature) => !featuresToActivate.includes(feature),
      )

      for (const feature of featuresToDeactivate) {
        await deactivateFeature(dbClient(), { tenantId, featureId: feature.id })
      }
    },
    {
      ensureSignedIn: true,
      hasAccess({ isSystemAdmin }) {
        return isSystemAdmin
      },
    },
  )

const Tenant = ({
  loaderData: { tenant, features, activeFeatures },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>{tenant.name}</Page.Header>

      <Page.Main>
        <Form>
          <h2>Features</h2>

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
            <SecondaryButton submit>Save features</SecondaryButton>
          </Form.Actions>
        </Form>
      </Page.Main>
    </Page>
  )
}

export default Tenant
