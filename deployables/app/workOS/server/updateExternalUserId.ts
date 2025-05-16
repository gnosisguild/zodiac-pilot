import { WorkOS } from '@workos-inc/node'
import type { UUID } from 'crypto'

type UpdateExternalUserIdOptions = {
  userId: string
  externalId: UUID
}

export const updateExternalUserId = ({
  userId,
  externalId,
}: UpdateExternalUserIdOptions) =>
  new WorkOS().userManagement.updateUser({ userId, externalId })
