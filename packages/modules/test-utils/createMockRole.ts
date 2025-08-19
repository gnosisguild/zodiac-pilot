import { Role } from 'zodiac-roles-sdk'
import { encodeRoleKey } from '../src'

export const createMockRole = (role: Partial<Role> = {}): Role => ({
  key: encodeRoleKey('test_role_key'),
  annotations: [],
  members: [],
  targets: [],
  lastUpdate: 0,

  ...role,
})
