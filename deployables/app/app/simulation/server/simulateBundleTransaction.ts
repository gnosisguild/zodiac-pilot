import { getChainId } from '@zodiac/chains'
import {
  unprefixAddress,
  type MetaTransactionRequest,
  type PrefixedAddress,
} from 'ser-kit'
import { simulationResultSchema } from '../types'
import { api } from './api'

export const simulateBundleTransaction = async (
  avatar: PrefixedAddress,
  transactions: MetaTransactionRequest[],
) => {
  const chainId = getChainId(avatar)
  const from = unprefixAddress(avatar)

  return api('/simulate-bundle', {
    schema: simulationResultSchema,
    method: 'POST',
    body: {
      simulations: transactions.map(({ to, data, value }) => ({
        network_id: chainId,
        from,
        to,
        input: data,
        value: value.toString(),
        save: true,
        save_if_fails: true,
        simulation_type: 'full',
      })),
    },
  })
}
