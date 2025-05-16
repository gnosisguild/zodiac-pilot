import { invariant } from '@epic-web/invariant'

export const getAdminOrganizationId = () => {
  const ADMIN_ORG_ID = process.env.ADMIN_ORG_ID

  invariant(ADMIN_ORG_ID != null, '"ADMIN_ORG_ID" environment variable not set')

  return ADMIN_ORG_ID
}
