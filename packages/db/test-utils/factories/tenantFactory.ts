import { invariant } from '@epic-web/invariant'
import { faker } from '@faker-js/faker'
import type { DBClient } from '@zodiac/db'
import {
  TenantMembershipTable,
  TenantTable,
  WorkspaceTable,
  type Tenant,
  type TenantCreateInput,
  type User,
} from '@zodiac/db/schema'
import { randomUUID, type UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { createFactory } from './createFactory'

export const tenantFactory = createFactory<
  TenantCreateInput & { defaultWorkspaceLabel?: string },
  Tenant,
  [members: User | [User, ...User[]]]
>({
  build(members, tenant) {
    if (Array.isArray(members)) {
      const [creator] = members

      return {
        name: faker.company.name(),
        externalId: randomUUID(),
        createdById: creator.id,

        ...tenant,
      }
    }

    return {
      name: faker.company.name(),
      externalId: randomUUID(),
      createdById: members.id,

      ...tenant,
    }
  },
  async create(db, data, members) {
    return db.transaction(async (tx) => {
      const [tenant] = await tx.insert(TenantTable).values(data).returning()

      if (Array.isArray(members)) {
        const [owner] = members

        await Promise.all(
          members.map((user) =>
            tx
              .insert(TenantMembershipTable)
              .values({ tenantId: tenant.id, userId: user.id }),
          ),
        )

        return addDefaultWorkspace(
          tx,
          tenant.id,
          owner,
          data.defaultWorkspaceLabel,
        )
      }

      await tx
        .insert(TenantMembershipTable)
        .values({ tenantId: tenant.id, userId: tenant.createdById })

      return addDefaultWorkspace(
        tx,
        tenant.id,
        members,
        data.defaultWorkspaceLabel,
      )
    })
  },
  createWithoutDb({ defaultWorkspaceId, ...data }) {
    return {
      createdAt: new Date(),
      id: randomUUID(),
      externalId: randomUUID(),
      defaultWorkspaceId: defaultWorkspaceId ?? randomUUID(),
      updatedAt: null,

      ...data,
    }
  },
})

const addDefaultWorkspace = async (
  db: DBClient,
  tenantId: UUID,
  owner: User,
  label: string = 'Default workspace',
): Promise<Tenant> => {
  const [workspace] = await db
    .insert(WorkspaceTable)
    .values({
      createdById: owner.id,
      label,
      tenantId,
    })
    .returning()

  const [tenant] = await db
    .update(TenantTable)
    .set({ defaultWorkspaceId: workspace.id })
    .where(eq(TenantTable.id, tenantId))
    .returning()

  const { defaultWorkspaceId, ...rest } = tenant

  invariant(defaultWorkspaceId != null, 'Default workspace id must not be null')

  return { ...rest, defaultWorkspaceId }
}
