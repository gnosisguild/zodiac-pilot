import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getWorkspace = async (db: DBClient, workspaceId: UUID) => {
  const workspace = await db.query.workspace.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, workspaceId)
    },
  })

  invariant(
    workspace != null,
    `Could not find workspace with id "${workspaceId}"`,
  )

  return workspace
}
