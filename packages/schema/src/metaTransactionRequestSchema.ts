import { OperationType } from '@safe-global/types-kit'
import { z } from 'zod'
import { decode } from './decode'
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

// This looks stupid, but will remove any additional properties
// from types that conform to the MetaTransactionRequest type
// but carry additional information
export const toMetaTransactionRequest = ({
  to,
  data,
  value,
  operation,
}: MetaTransactionRequest): MetaTransactionRequest => ({
  to,
  data,
  value,
  operation,
})

export const parseTransactionData = (
  transactionData: string,
): MetaTransactionRequest[] => {
  try {
    const rawJson = decode(transactionData)

    return metaTransactionRequestSchema.array().parse(rawJson)
  } catch (error) {
    console.error('Error parsing the route from the URL', { error })

    throw new Response(JSON.stringify(error), { status: 400 })
  }
}
