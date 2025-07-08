import { type Account, type StartingPoint } from 'ser-kit'
import { createMockEoaAccount } from './createMockEoaAccount'

export const createMockStartingWaypoint = (
  account: Account = createMockEoaAccount(),
): StartingPoint => ({
  account,
})
