import { getWorkOS } from '@workos-inc/authkit-react-router'

export const getUsers = async () => {
  const { data } = await getWorkOS().userManagement.listUsers()

  return data
}
