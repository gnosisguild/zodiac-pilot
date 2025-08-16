import { ExecutionAccount, type StartingPoint } from 'ser-kit'
import { createMockEoaAccount } from './createMockEoaAccount'

export const createMockStartingWaypoint = (
  account: ExecutionAccount = createMockEoaAccount(),
): StartingPoint => ({
  account,
})
