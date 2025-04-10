import { z } from 'zod'
import { api, type FetchOptions } from './api'

const accountsSchema = z.object({ label: z.string(), id: z.string() }).array()

export const getAccounts = ({ signal }: FetchOptions) =>
  api('/extension/accounts', { schema: accountsSchema, signal })
