import type { StartingPoint } from 'ser-kit'
import {
  createEoaAccount,
  type CreateEoaAccountOptions,
} from './createEoaAccount'

export const createEoaStartingPoint = (
  options: CreateEoaAccountOptions,
): StartingPoint => ({
  account: createEoaAccount(options),
})
