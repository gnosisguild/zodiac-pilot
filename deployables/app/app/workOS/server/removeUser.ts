import { getWorkOS } from '@workos-inc/authkit-react-router'

export const removeUser = (userId: string) =>
  getWorkOS().userManagement.deleteUser(userId)
