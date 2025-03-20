import { z } from 'zod'

const tokenInfoSchema = z.object({
  standard: z.string().optional(),
  contract_address: z.string().optional(),
})

const assetChangeSchema = z.object({
  token_info: tokenInfoSchema,
  from: z.string().optional(),
  to: z.string().optional(),
  raw_amount: z.string(),
})

const balanceChangeSchema = z.object({
  address: z.string(),
  dollar_value: z.string(),
  transfers: z.array(z.number()),
})

const transactionInfoSchema = z.object({
  logs: z.any().nullable(),
  asset_changes: z.array(assetChangeSchema).nullable().default([]).optional(),
  balance_changes: z.array(balanceChangeSchema).optional().nullable(),
})

const transactionSchema = z.object({
  network_id: z.string(),
  transaction_info: transactionInfoSchema,
})

const simulationRunResultSchema = z.object({
  transaction: transactionSchema,
})

export const simulationResultSchema = z.object({
  simulation_results: z.array(simulationRunResultSchema),
})

export type SimulationResult = z.infer<typeof simulationResultSchema>
