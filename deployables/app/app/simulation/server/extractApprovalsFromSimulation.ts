import { addressSchema, type HexAddress } from '@zodiac/schema'
import { z } from 'zod'
import type { SimulatedTransaction } from '../types'

export type ApprovalTransaction = {
  spender: HexAddress
  tokenAddress: HexAddress
}

const ownerSchema = z.object({
  soltype: z.object({
    name: z.literal('owner'),
  }),
  value: addressSchema,
})
const spenderSchema = z.object({
  soltype: z.object({
    name: z.literal('spender'),
  }),
  value: addressSchema,
})
const valueSchema = z.object({
  soltype: z.object({
    name: z.literal('value'),
  }),
  value: z.string(),
})

const approvalLogSchema = z.object({
  name: z.literal('Approval'),
  raw: z.object({
    address: addressSchema,
  }),
  inputs: z.tuple([ownerSchema, spenderSchema, valueSchema]),
})

export type ApprovalLog = z.infer<typeof approvalLogSchema>

const genericLogSchema = z
  .object({ name: z.string().optional() })
  .passthrough()
  .array()
  .optional()

export const extractApprovalsFromSimulation = (
  transactions: SimulatedTransaction[],
): ApprovalTransaction[] => {
  return transactions.flatMap(({ transaction_info: { logs } }) => {
    const allLogs = genericLogSchema.parse(logs)

    if (allLogs == null) {
      return []
    }

    const approvalLogs = allLogs
      .filter(({ name }) => name === 'Approval')
      .map((log) => approvalLogSchema.parse(log))

    return approvalLogs.map(({ raw: { address }, inputs: [, spender] }) => ({
      tokenAddress: address,
      spender: spender.value,
    }))
  })
}
