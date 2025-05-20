import { getWorkOS } from '@workos-inc/authkit-react-router'

export const getUser = (userId: string) =>
  getWorkOS().userManagement.getUser(userId)
