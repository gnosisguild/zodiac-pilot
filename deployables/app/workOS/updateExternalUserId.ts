import { WorkOS } from '@workos-inc/node'

type UpdateExternalUserIdOptions = {
  userId: string
  externalId: string
}

export const updateExternalUserId = ({
  userId,
  externalId,
}: UpdateExternalUserIdOptions) =>
  new WorkOS().userManagement.updateUser({ userId, externalId })
