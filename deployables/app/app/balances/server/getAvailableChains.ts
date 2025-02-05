import { chainListSchema } from '../types'
import { api } from './api'

export const getAvailableChains = () =>
  api('/chain/list', { schema: chainListSchema })
