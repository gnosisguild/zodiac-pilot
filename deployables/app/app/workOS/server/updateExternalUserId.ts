import { getWorkOS } from '@workos-inc/authkit-react-router'
import type { UUID } from 'crypto'

type UpdateExternalUserIdOptions = {
  userId: string
  externalId: UUID
}

export const updateExternalUserId = ({
  userId,
  externalId,
}: UpdateExternalUserIdOptions) =>
  getWorkOS().userManagement.updateUser({ userId, externalId })
