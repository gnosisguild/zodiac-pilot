import { KnownContracts } from '@gnosis.pm/zodiac'

import { TransactionTranslation } from './types'
import { FunctionFragment, Interface } from 'ethers'

const uniswapMulticallInterface = new Interface([
  'function multicall(bytes[] calldata data) external returns (bytes[] memory results)',
  'function multicall(uint256 deadline, bytes[] calldata data) external returns (bytes[] memory results)',
  'function multicall(bytes32 previousBlockhash, bytes[] calldata data) external returns (bytes[] memory results)',
])

export default {
  title: 'Unfold individual calls',

  recommendedFor: [KnownContracts.ROLES_V1, KnownContracts.ROLES_V2],

  translate: async (transaction) => {
    if (!transaction.data) {
      return undefined
    }

    let functionCalls: string[] = []
    for (const fragment of uniswapMulticallInterface.fragments) {
      if (fragment.type !== 'function') continue
      try {
        functionCalls = uniswapMulticallInterface.decodeFunctionData(
          fragment as FunctionFragment,
          transaction.data
        ).data as string[]
        break
      } catch (e) {
        continue
      }
    }

    if (functionCalls.length === 0) {
      return undefined
    }

    return functionCalls.map((data) => ({ ...transaction, data }))
  },
} satisfies TransactionTranslation
