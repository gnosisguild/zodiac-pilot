import { invariant } from '@epic-web/invariant'

export const getE2ECredentials = () => {
  const E2E_TEST_USER = process.env.E2E_TEST_USER
  const E2E_TEST_USER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD

  invariant(E2E_TEST_USER != null, 'E2E test user not defined')
  invariant(
    E2E_TEST_USER_PASSWORD != null,
    'E2E test user password not defined',
  )

  return { user: E2E_TEST_USER, password: E2E_TEST_USER_PASSWORD }
}
