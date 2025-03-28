import { createTenant, dbClient } from '@/db'
import { WorkOS } from '@workos-inc/node'
import { getString } from '@zodiac/form-data'
import { Form, PrimaryButton, TextInput } from '@zodiac/ui'
import type { Route } from './+types/sign-up'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.formData()

  const tenantName = getString(data, 'tenantName')

  const tenant = await createTenant(dbClient(), { name: tenantName })

  const workOS = new WorkOS()
  workOS.organizations.createOrganization({
    name: tenantName,
    externalId: tenant.id,
  })

  return null
}

const SignUp = () => {
  return (
    <Form>
      <TextInput label="Email" />
      <TextInput label="Organization name" name="tenantName" />

      <Form.Actions>
        <PrimaryButton submit>Sign up</PrimaryButton>
      </Form.Actions>
    </Form>
  )
}

export default SignUp
