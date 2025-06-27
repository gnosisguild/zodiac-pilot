import { jsonStringify, type MetaTransactionRequest } from '@zodiac/schema'
import type { UUID } from 'crypto'
import { z } from 'zod'
import { api, type FetchOptions } from './api'

const schema = z.object({ proposalId: z.string().uuid() })

export const createProposal = (
  accountId: UUID,
  transaction: MetaTransactionRequest[],
  options: FetchOptions,
) =>
  api(`/extension/account/${accountId}/propose-transaction`, {
    ...options,
    schema,
    body: { transaction: jsonStringify(transaction) },
  })
