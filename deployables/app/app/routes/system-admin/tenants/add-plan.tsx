import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { activatePlan, dbClient, getSubscriptionPlans } from '@zodiac/db'
import { getUUID } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, GhostButton, Modal, PrimaryButton, Select } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/add-plan'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async () => {
      return { plans: await getSubscriptionPlans(dbClient()) }
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

      invariantResponse(isUUID(tenantId), 'Tenant id is not a UUID')

      const subscriptionPlanId = getUUID(data, 'plan')

      await activatePlan(dbClient(), {
        tenantId,
        subscriptionPlanId,
      })

      return redirect(href('/system-admin/tenant/:tenantId', { tenantId }))
    },
    {
      ensureSignedIn: true,
      hasAccess({ isSystemAdmin }) {
        return isSystemAdmin
      },
    },
  )

const AddPlan = ({
  loaderData: { plans },
  params: { tenantId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Add plan"
      onClose={() =>
        navigate(href('/system-admin/tenant/:tenantId', { tenantId }))
      }
    >
      <Form>
        <Select
          label="Plan"
          name="plan"
          options={plans.map((plan) => ({ label: plan.name, value: plan.id }))}
        />

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.AddPlan}
            busy={useIsPending(Intent.AddPlan)}
          >
            Add
          </PrimaryButton>
          <GhostButton
            onClick={() =>
              navigate(href('/system-admin/tenant/:tenantId', { tenantId }))
            }
          >
            Cancel
          </GhostButton>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default AddPlan

enum Intent {
  AddPlan = 'AddPlan',
}
