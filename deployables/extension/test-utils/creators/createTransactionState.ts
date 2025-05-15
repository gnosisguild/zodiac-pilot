import type { State } from '@/state'

export const createTransactionState = (state: Partial<State> = {}): State => ({
  pending: [],
  executed: [],

  rollback: null,
  refresh: false,

  ...state,
})
