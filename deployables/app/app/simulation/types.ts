import type { HexAddress } from '@zodiac/schema'
import { z } from 'zod'

const tokenInfoSchema = z.object({
  standard: z.string().optional(),
  type: z.string(),
  symbol: z.string(),
  contract_address: z.string().optional(),
  name: z.string(),
  logo: z.string().url().nullable().or(z.string().length(0)),
  decimals: z.number(),
  dollar_value: z.string(),
})

const assetChangeSchema = z.object({
  token_info: tokenInfoSchema,
  type: z.string(),
  from: z.string(),
  to: z.string(),
  amount: z.string(),
  raw_amount: z.string(),
  dollar_value: z.string(),
})

const diffSchema = z.object({
  address: z.string(),
  original: z.string(),
  dirty: z.string(),
  is_miner: z.boolean().optional(),
})

const nonceDiffSchema = z.object({
  address: z.string(),
  original: z.string(),
  dirty: z.string(),
})

const balanceChangeSchema = z.object({
  address: z.string(),
  dollar_value: z.string(),
  transfers: z.array(z.number()),
})

const transactionInfoSchema = z.object({
  contract_id: z.string(),
  block_number: z.number(),
  transaction_id: z.string(),
  contract_address: z.string(),
  method: z.string().nullable(),
  parameters: z.any().nullable(),
  intrinsic_gas: z.number(),
  refund_gas: z.number(),
  logs: z.any().nullable(),
  balance_diff: z.array(diffSchema).nullable().default([]),
  nonce_diff: z.array(nonceDiffSchema).nullable().default([]),
  state_diff: z.any().nullable(),
  raw_state_diff: z.any().nullable(),
  console_logs: z.any().nullable(),
  asset_changes: z.array(assetChangeSchema).nullable().default([]).optional(),
  balance_changes: z.array(balanceChangeSchema).optional(),
  created_at: z.string(),
})

const simulationSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  owner_id: z.string(),
  network_id: z.string(),
  block_number: z.number(),
  transaction_index: z.number(),
  from: z.string(),
  to: z.string(),
  input: z.string(),
  gas: z.number(),
  gas_price: z.string(),
  gas_used: z.number(),
  value: z.string(),
  status: z.boolean(),
  deposit_tx: z.boolean(),
  system_tx: z.boolean(),
  nonce: z.number(),
  addresses: z.array(z.string()),
  contract_ids: z.array(z.string()),
  created_at: z.string(),
})

const contractItemSchema = z.object({
  id: z.string(),
  contract_id: z.string(),
  balance: z.string(),
  network_id: z.string(),
  public: z.boolean(),
  verification_date: z.string(),
  address: z.string(),
  contract_name: z.string(),
  ens_domain: z.string().nullable(),
  type: z.string(),
  evm_version: z.string(),
  compiler_version: z.string(),
  optimizations_used: z.boolean(),
  optimization_runs: z.number(),
  libraries: z.any().nullable(),
  compiler_settings: z.record(z.any()),
  deployed_bytecode: z.string(),
  creation_bytecode: z.string(),
  data: z.object({
    main_contract: z.number(),
    contract_info: z.array(
      z.object({
        id: z.number(),
        path: z.string(),
        name: z.string(),
        source: z.string(),
      }),
    ),
    abi: z.array(z.any()),
    raw_abi: z.array(z.any()),
    states: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        storage_location: z.string(),
        offset: z.number(),
        index: z.string(),
        indexed: z.boolean().optional(),
        simple_type: z.object({ type: z.string() }).optional(),
      }),
    ),
  }),
  src_map: z.record(z.any()),
  creation_block: z.number(),
  creation_tx: z.string(),
  creator_address: z.string(),
  created_at: z.string(),
  language: z.string(),
  in_project: z.boolean(),
})

const transactionSchema = z.object({
  hash: z.string(),
  block_hash: z.string(),
  block_number: z.number(),
  from: z.string(),
  gas: z.number(),
  gas_price: z.number(),
  gas_fee_cap: z.number(),
  gas_tip_cap: z.number(),
  cumulative_gas_used: z.number(),
  gas_used: z.number(),
  effective_gas_price: z.number(),
  input: z.string(),
  nonce: z.number(),
  to: z.string(),
  index: z.number(),
  value: z.string(),
  status: z.boolean(),
  network_id: z.string(),
  timestamp: z.string(),
  function_selector: z.string(),
  l1_block_number: z.number(),
  l1_timestamp: z.number(),
  deposit_tx: z.boolean(),
  system_tx: z.boolean(),
  transaction_info: transactionInfoSchema,
  method: z.string(),
})

const simulationRunResultSchema = z.object({
  transaction: transactionSchema,
  simulation: simulationSchema,
  contracts: z.array(contractItemSchema).default([]),
})

export type SimulationParams = {
  network_id: number
  save: boolean
  save_if_fails: boolean
  simulation_type: 'full' | 'quick' | 'abi'
  from: HexAddress
  to: HexAddress
  input: string
  value: string
}

export const simulationResultSchema = z.object({
  simulation_results: z.array(simulationRunResultSchema),
})

export type SimulationResult = z.infer<typeof simulationResultSchema>
