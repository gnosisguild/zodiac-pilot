import type { Tenant } from '@zodiac/db/schema'
import type { DBClient } from '../../dbClient'
import { getWorkspace } from './getWorkspace'

export const getDefaultWorkspace = async (db: DBClient, tenant: Tenant) =>
  getWorkspace(db, tenant.defaultWorkspaceId)
