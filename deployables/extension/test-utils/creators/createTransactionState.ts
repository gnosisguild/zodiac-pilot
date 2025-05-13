import type { State } from '@/state'

export const createTransactionState = (state: Partial<State> = {}): State => ({
  pending: [],
  confirmed: [],
  done: [],
  failed: [],
  reverted: [],

  ...state,
})
