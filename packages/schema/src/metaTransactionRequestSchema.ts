import { OperationType } from '@safe-global/types-kit'
import { z } from 'zod'
import { hexSchema } from './hex'

const operationTypeSchema = z.union([
  z.literal(OperationType.Call),
  z.literal(OperationType.DelegateCall),
])

export const metaTransactionRequestSchema = z.object({
  to: hexSchema,
  data: hexSchema,
  value: z.coerce.bigint(),
  operation: operationTypeSchema.optional(),
})

export type MetaTransactionRequest = z.infer<
  typeof metaTransactionRequestSchema
>
