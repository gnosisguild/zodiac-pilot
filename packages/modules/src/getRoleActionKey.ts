export const getRoleActionKey = (label: string) =>
  label
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 32)
