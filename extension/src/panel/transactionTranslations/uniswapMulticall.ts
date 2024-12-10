import { KnownContracts } from '@gnosis.pm/zodiac'
import { FunctionFragment, Interface } from 'ethers'
import { UnfoldVertical } from 'lucide-react'
import type { TransactionTranslation } from './types'

const uniswapMulticallInterface = new Interface([
  'function multicall(bytes[] calldata data) external returns (bytes[] memory results)',
  'function multicall(uint256 deadline, bytes[] calldata data) external returns (bytes[] memory results)',
  'function multicall(bytes32 previousBlockhash, bytes[] calldata data) external returns (bytes[] memory results)',
])

export const uniswapMulticall = {
  title: 'Unfold individual calls',
  icon: UnfoldVertical,
  recommendedFor: [KnownContracts.ROLES_V1, KnownContracts.ROLES_V2],

  translate: async (transaction) => {
    const { to, data, value } = transaction

    if (!data) {
      return undefined
    }

    if (parseInt(value) > 0) {
      // We don't support unfolding of transactions with value since it's hard to tell which individual calls are supposed to receive the value
      return undefined
    }

    let functionCalls: string[] = []
    for (const fragment of uniswapMulticallInterface.fragments) {
      if (fragment.type !== 'function') continue
      try {
        functionCalls = uniswapMulticallInterface.decodeFunctionData(
          fragment as FunctionFragment,
          data
        ).data as string[]
        break
      } catch (e) {
        continue
      }
    }

    if (functionCalls.length === 0) {
      return undefined
    }

    return functionCalls.map((data) => ({ to, data, value: '0' }))
  },
} satisfies TransactionTranslation
