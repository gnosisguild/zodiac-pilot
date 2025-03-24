export const getRolesAppUrl = () => {
  const ROLES_APP_URL =
    process.env.ROLES_APP_URL || 'https://roles.gnosisguild.org'

  if (ROLES_APP_URL.endsWith('/')) {
    return ROLES_APP_URL.slice(0, ROLES_APP_URL.length - 1)
  }

  return ROLES_APP_URL
}
