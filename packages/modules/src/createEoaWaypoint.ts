import type { StartingPoint } from 'ser-kit'
import {
  createEoaAccount,
  type CreateEoaAccountOptions,
} from './createEoaAccount'

export const createEoaWaypoint = (
  options: CreateEoaAccountOptions,
): StartingPoint => ({
  account: createEoaAccount(options),
})
