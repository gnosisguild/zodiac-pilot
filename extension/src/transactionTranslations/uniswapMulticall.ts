import { KnownContracts } from '@gnosis.pm/zodiac'
import { Interface } from 'ethers/lib/utils'
import { MetaTransaction } from 'react-multisend'

import { TransactionTranslation } from './types'

const uniswapMulticallInterface = new Interface([
  'function multicall(bytes[] calldata data) external returns (bytes[] memory results)',
])

const unwrapMulticall = (transaction: MetaTransaction): MetaTransaction[] => {
  if (!transaction.data) return [transaction]

  let functionCalls: string[]
  try {
    functionCalls = uniswapMulticallInterface.decodeFunctionData(
      'multicall',
      transaction.data
    ).data as string[]
  } catch (e) {
    return [transaction]
  }

  if (functionCalls && functionCalls.length > 0) {
    return functionCalls.map((data) => ({ ...transaction, data }))
  }

  return [transaction]
}

export default {
  name: 'Unwrap Uniswap multicall',
  description: 'Unwraps the individual transactions of Uniswap multicalls',
  recommendedFor: [KnownContracts.ROLES],
  translation: unwrapMulticall,
} satisfies TransactionTranslation
