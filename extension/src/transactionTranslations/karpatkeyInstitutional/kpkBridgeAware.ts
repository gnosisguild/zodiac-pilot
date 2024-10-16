import { KnownContracts } from '@gnosis.pm/zodiac'

import { TransactionTranslation } from '../types'
import { Interface } from 'ethers'
import { extractBridgedTokenAddress } from './bridges'

//Abstracting for mainnet

const BridgeAwareInterface: Interface = new Interface([
  `function bridgeStart(address asset)`,
])

export default {
  title: 'Unfold individual calls',

  recommendedFor: [KnownContracts.ROLES_V1, KnownContracts.ROLES_V2],

  translate: async (transaction) => {
    const bridgedTokenAddress = extractBridgedTokenAddress(transaction)

    if (!bridgedTokenAddress) {
      return
    }

    const bridgeAwareContractAddress = '0x1234'

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
