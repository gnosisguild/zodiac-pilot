import type { State } from '@/state'

export const createTransactionState = (state: Partial<State> = {}): State => ({
  pending: [],
  done: [],
  failed: [],
  reverted: [],

  ...state,
})
