import { addressSchema, type HexAddress } from '@zodiac/schema'
import { z } from 'zod'
import type { SimulatedTransaction } from '../types'

export type Approval = {
  spender: HexAddress
  tokenAddress: HexAddress
  approvalAmount: bigint
  symbol: string
  logoUrl: string
  decimals: number
}

const ownerSchema = z.object({
  soltype: z.object({
    // name: z.literal('owner'),
    name: z.string(),
  }),
  value: addressSchema,
})
const spenderSchema = z.object({
  soltype: z.object({
    // name: z.literal('spender'),
    name: z.string(),
  }),
  value: addressSchema,
})
const valueSchema = z.object({
  soltype: z.object({
    // name: z.literal('value'),
    name: z.string(),
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
  .nullable()
  .optional()

const groupApprovals = (approvals: Approval[]): Approval[] => {
  const grouped = new Map<string, Approval>()

  approvals.forEach((approval) => {
    const key = `${approval.tokenAddress.toLowerCase()}-${approval.spender.toLowerCase()}`

    if (!grouped.has(key)) {
      grouped.set(key, approval)
    }
  })

  return Array.from(grouped.values())
}

export const extractApprovalsFromSimulation = (
  transactions: SimulatedTransaction[],
): Approval[] => {
  const approvals = transactions.flatMap(({ transaction_info }) => {
    const allLogs = genericLogSchema.parse(transaction_info.logs)

    if (!allLogs) {
      return []
    }
    const approvalLogs = allLogs
      .filter(({ name }) => name === 'Approval')
      .map((log) => approvalLogSchema.parse(log))
    return approvalLogs.map(
      ({ raw: { address }, inputs: [, spender, amount] }) => {
        const tokenInfo = transaction_info.exposure_changes?.find(
          (token) => token.token_info.contract_address === address,
        )
        return {
          symbol: tokenInfo?.token_info.symbol ?? '',
          logoUrl: tokenInfo?.token_info.logo ?? '',
          decimals: tokenInfo?.token_info.decimals ?? 0,
          tokenAddress: address,
          spender: spender.value,
          approvalAmount: BigInt(amount.value),
        }
      },
    )
  })

  return groupApprovals(approvals)
}
