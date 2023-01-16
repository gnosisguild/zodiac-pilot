import { KnownContracts } from '@gnosis.pm/zodiac'
import { Interface } from 'ethers/lib/utils'

import { TransactionTranslation } from './types'

const uniswapMulticallInterface = new Interface([
  'function multicall(bytes[] calldata data) external returns (bytes[] memory results)',
])

export default {
  title: 'Unfold individual calls',

  recommendedFor: [KnownContracts.ROLES],

  translate: (transaction) => {
    if (!transaction.data) return [transaction]

    let functionCalls: string[]
    try {
      functionCalls = uniswapMulticallInterface.decodeFunctionData(
        'multicall',
        transaction.data
      ).data as string[]
    } catch (e) {
      return undefined
    }

    if (functionCalls && functionCalls.length > 0) {
      return functionCalls.map((data) => ({ ...transaction, data }))
    }

    return [transaction]
  },
} satisfies TransactionTranslation
