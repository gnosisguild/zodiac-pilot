import { getChain, getTokenDetails } from '@/balances-server'
import { verifyChainId } from '@zodiac/chains'
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
  inputs: z.tuple([ownerSchema, spenderSchema, valueSchema]).rest(z.any()),
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

export const extractApprovalsFromSimulation = async (
  transactions: SimulatedTransaction[],
): Promise<Approval[]> => {
  const approvalsArrays = await Promise.all(
    transactions.map(async ({ network_id, transaction_info }) => {
      const allLogs = genericLogSchema.parse(transaction_info.logs) || []

      const chain = await getChain(verifyChainId(parseInt(network_id)))

      const approvalLogs = allLogs
        .filter(({ name }) => name === 'Approval')
        .map((log) => approvalLogSchema.parse(log))

      const approvalsForTx = await Promise.all(
        approvalLogs.map(
          async ({ raw: { address }, inputs: [, spender, amount] }) => {
            const tokenDetails = await getTokenDetails(chain, { address })

            return {
              symbol: tokenDetails?.symbol ?? '',
              logoUrl: tokenDetails?.logoUrl ?? '',
              decimals: tokenDetails?.decimals ?? 0,
              tokenAddress: address,
              spender: spender.value,
              approvalAmount: BigInt(amount.value),
            }
          },
        ),
      )

      return approvalsForTx
    }),
  )

  const approvalsFlat = approvalsArrays.flat()
  return groupApprovals(approvalsFlat)
}
