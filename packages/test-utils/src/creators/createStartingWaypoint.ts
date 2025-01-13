import { type Account, type StartingPoint } from 'ser-kit'
import { createEoaAccount } from './createEoaAccount'

export const createStartingWaypoint = (
  account: Account = createEoaAccount(),
): StartingPoint => ({
  account,
})
