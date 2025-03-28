import { Page } from '@/components'
import { createTenant, dbClient } from '@/db'
import { routeTitle } from '@/utils'
import { createOrganization } from '@/workOS'
import * as Sentry from '@sentry/react-router'
import { getString } from '@zodiac/form-data'
import { Error, Form, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect } from 'react-router'
import type { Route } from './+types/sign-up'

export const meta: Route.MetaFunction = ({ matches }) => [
  { title: routeTitle(matches, 'Sign Up') },
]

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.formData()

  const tenantName = getString(data, 'tenantName')
  const email = getString(data, 'email')

  try {
    await dbClient().transaction(async (tx) => {
      const tenant = await createTenant(tx, { name: tenantName })

      await createOrganization({
        name: tenantName,
        adminEmail: email,
        externalId: tenant.id,
      })
    })

    return redirect(href('/sign-up/success'))
  } catch (error) {
    Sentry.captureException(error)

    console.error(error)

    return { error: true }
  }
}

const SignUp = ({ actionData }: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Sign Up</Page.Header>

      <Page.Main>
        <Form>
          {actionData && actionData.error && (
            <Error title="Sign up failed">
              We could not create an organization.
            </Error>
          )}

          <TextInput label="Email" name="email" />
          <TextInput label="Organization name" name="tenantName" />

          <Form.Actions>
            <PrimaryButton submit>Sign up</PrimaryButton>
          </Form.Actions>
        </Form>
      </Page.Main>
    </Page>
  )
}

export default SignUp
