import type { User } from '@workos-inc/node'
import { randomUUID } from 'crypto'

export const createMockWorkOsUser = (user: Partial<User> = {}): User => ({
  createdAt: new Date().toISOString(),
  email: 'test@test.com',
  emailVerified: true,
  externalId: null,
  firstName: null,
  id: randomUUID(),
  lastName: null,
  lastSignInAt: null,
  metadata: {},
  object: 'user',
  profilePictureUrl: null,
  updatedAt: new Date().toISOString(),

  ...user,
})
