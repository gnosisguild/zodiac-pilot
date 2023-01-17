import { KnownContracts } from '@gnosis.pm/zodiac'
import { FunctionFragment, Interface } from 'ethers/lib/utils'

import { TransactionTranslation } from './types'

const uniswapMulticallInterface = new Interface([
  'function multicall(bytes[] calldata data) external returns (bytes[] memory results)',
  'function multicall(uint256 deadline, bytes[] calldata data) external returns (bytes[] memory results)',
  'function multicall(bytes32 previousBlockhash, bytes[] calldata data) external returns (bytes[] memory results)',
])

export default {
  title: 'Unfold individual calls',

  recommendedFor: [KnownContracts.ROLES],

  translate: (transaction) => {
    if (!transaction.data) return [transaction]

    let functionCalls: string[] = []
    for (const fragment of uniswapMulticallInterface.fragments) {
      if (!(fragment instanceof FunctionFragment)) continue
      try {
        functionCalls = uniswapMulticallInterface.decodeFunctionData(
          fragment,
          transaction.data
        ).data as string[]
        break
      } catch (e) {
        continue
      }
    }

    if (functionCalls.length > 0) {
      return functionCalls.map((data) => ({ ...transaction, data }))
    }

    return [transaction]
  },
} satisfies TransactionTranslation
