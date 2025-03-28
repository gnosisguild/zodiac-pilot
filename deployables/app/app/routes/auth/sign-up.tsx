import { createTenant, dbClient } from '@/db'
import { WorkOS } from '@workos-inc/node'
import { getString } from '@zodiac/form-data'
import { Form, PrimaryButton, TextInput } from '@zodiac/ui'
import type { Route } from './+types/sign-up'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.formData()

  const tenantName = getString(data, 'tenantName')
  const email = getString(data, 'email')

  await dbClient().transaction(async (tx) => {
    const tenant = await createTenant(tx, { name: tenantName })
    const workOS = new WorkOS()

    const workOSOrganization = await workOS.organizations.createOrganization({
      name: tenantName,
      externalId: tenant.id,
    })

    try {
      await workOS.userManagement.sendInvitation({
        email,
        organizationId: workOSOrganization.id,
        roleSlug: 'admin',
      })
    } catch (e) {
      await workOS.organizations.deleteOrganization(workOSOrganization.id)

      throw e
    }
  })

  return null
}

const SignUp = () => {
  return (
    <Form>
      <TextInput label="Email" name="email" />
      <TextInput label="Organization name" name="tenantName" />

      <Form.Actions>
        <PrimaryButton submit>Sign up</PrimaryButton>
      </Form.Actions>
    </Form>
  )
}

export default SignUp
