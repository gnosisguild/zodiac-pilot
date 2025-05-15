import { OperationType } from '@safe-global/types-kit'
import { z } from 'zod'
import { hexSchema } from './hex'
import { addressSchema } from './routeSchema'

const operationTypeSchema = z.union([
  z.literal(OperationType.Call),
  z.literal(OperationType.DelegateCall),
])

export const metaTransactionRequestSchema = z.object({
  to: addressSchema,
  data: hexSchema,
  value: z.coerce.bigint(),
  operation: operationTypeSchema.optional(),
})

export type MetaTransactionRequest = z.infer<
  typeof metaTransactionRequestSchema
>

export const metaTransactionRequestEqual = (
  a: MetaTransactionRequest,
  b: MetaTransactionRequest,
) =>
  a.to.toLowerCase() === b.to.toLowerCase() &&
  (a.value || 0n === b.value || 0n) &&
  a.data === b.data &&
  (a.operation || 0 === b.operation || 0)
