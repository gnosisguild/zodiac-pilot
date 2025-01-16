import type { StartingPoint } from 'ser-kit'
import {
  createSafeAccount,
  type CreateSafeAccountOptions,
} from './createSafeAccount'

export const createSafeStartingPoint = (
  options: CreateSafeAccountOptions,
): StartingPoint => ({
  account: createSafeAccount(options),
})
