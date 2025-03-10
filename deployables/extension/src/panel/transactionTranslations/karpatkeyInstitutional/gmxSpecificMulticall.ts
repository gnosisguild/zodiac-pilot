import type { HexAddress } from '@/types'
import { Chain } from '@zodiac/chains'
import { SupportedZodiacModuleType } from '@zodiac/modules'
import { FunctionFragment, Interface } from 'ethers'
import { UnfoldVertical } from 'lucide-react'
import type { TransactionTranslation } from '../types'

const uniswapMulticallInterface = new Interface([
  'function multicall(bytes[] calldata data) external returns (bytes[] memory results)',
  'function multicall(uint256 deadline, bytes[] calldata data) external returns (bytes[] memory results)',
  'function multicall(bytes32 previousBlockhash, bytes[] calldata data) external returns (bytes[] memory results)',
])

const gmxMulticallInterface = new Interface([
  'function sendWnt(address receiver, uint256 amount) external',
])

const gmxExchangeRouterContractAddress =
  '0x900173A66dbD345006C51fA35fA3aB760FcD843b'

export const gmxSpecific = {
  title: 'Unfold GMX multicall and handle ETH correctly',
  icon: UnfoldVertical,
  recommendedFor: [
    SupportedZodiacModuleType.ROLES_V1,
    SupportedZodiacModuleType.ROLES_V2,
  ],

  translate: async (transaction, chainId) => {
    const { to, data, value } = transaction

    if (!data) {
      return undefined
    }
    const sendWntSelector =
      gmxMulticallInterface.getFunction('sendWnt')?.selector
    let functionCalls: HexAddress[] = []
    for (const fragment of uniswapMulticallInterface.fragments) {
      if (fragment.type !== 'function') continue
      try {
        functionCalls = uniswapMulticallInterface.decodeFunctionData(
          fragment as FunctionFragment,
          data,
        ).data as HexAddress[]
        break
      } catch {
        continue
      }
    }

    if (functionCalls.length === 0) {
      return undefined
    }
    return functionCalls.map((data) => {
      const isSendWnt =
        data.slice(0, 10) === sendWntSelector && chainId === Chain.ARB1

      return {
        to,
        data,
        value: isSendWnt ? value : 0n,
      }
    })
  },
} satisfies TransactionTranslation
