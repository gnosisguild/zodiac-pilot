import { KnownContracts } from '@gnosis.pm/zodiac'

import { TransactionTranslation } from '../types'
import { Interface } from 'ethers'
import { extractBridgedTokenAddress } from './bridges'

const KARPATKEY_INSTITUTIONAL_AVATARS = [
  '0x846e7f810e08f1e2af2c5afd06847cc95f5cae1b',
]

const BridgeAwareInterface: Interface = new Interface([
  `function bridgeStart(address asset)`,
])

export default {
  title: 'Add bridgeStart call',

  recommendedFor: [KnownContracts.ROLES_V2],
  autoApply: true,

  translate: async (transaction, chainId, avatarAddress) => {
    if (
      !KARPATKEY_INSTITUTIONAL_AVATARS.includes(avatarAddress.toLowerCase())
    ) {
      return
    }

    const bridgedTokenAddress = extractBridgedTokenAddress(transaction)

    if (!bridgedTokenAddress) {
      return
    }

    const bridgeAwareContractAddress =
      '0x36B2a59f3CDa3db1283FEBc7c228E89ecE7Db6f4'

    return [
      transaction,
      {
        to: bridgeAwareContractAddress,
        data: BridgeAwareInterface.encodeFunctionData('bridgeStart', [
          bridgedTokenAddress,
        ]),
        value: '0x00',
      },
    ]
  },
} satisfies TransactionTranslation
