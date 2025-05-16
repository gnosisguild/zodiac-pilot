import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import {
  activateFeatures,
  dbClient,
  deactivateFeatures,
  getActiveFeatures,
  getFeatures,
  getTenant,
} from '@zodiac/db'
import { getBoolean, getMap } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
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
  loaderData: { tenant, features, activeFeatures },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>{tenant.name}</Page.Header>

      <Page.Main>
        <div className="grid grid-cols-6">
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
    </Page>
  )
}

export default Tenant

enum Intent {
  UpdateFeatures = 'UpdateFeatures',
}
