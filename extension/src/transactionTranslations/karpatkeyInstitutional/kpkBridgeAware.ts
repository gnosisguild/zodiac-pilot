import { KnownContracts } from '@gnosis.pm/zodiac'

import { TransactionTranslation } from '../types'
import { Interface } from 'ethers'
import { extractBridgedTokenAddress } from './bridges'

const KARPATKEY_INSTITUTIONAL_AVATARS = [
  '0x846e7f810e08f1e2af2c5afd06847cc95f5cae1b',
  '0xd0ca2a7ed8aee7972750b085b27350f1cd387f9b'
]

const BRIDGE_AWARE_CONTRACT_ADDRESS =
  '0x36B2a59f3CDa3db1283FEBc7c228E89ecE7Db6f4'

const BridgeAwareInterface: Interface = new Interface([
  `function bridgeStart(address asset)`,
])

export default {
  title: 'Add bridgeStart call',

  recommendedFor: [KnownContracts.ROLES_V2],
  autoApply: true,

  translate: async (transaction, chainId, avatarAddress, allTransactions) => {
    if (
      !KARPATKEY_INSTITUTIONAL_AVATARS.includes(avatarAddress.toLowerCase())
    ) {
      return
    }

    const bridgedTokenAddress = extractBridgedTokenAddress(transaction, chainId)

    if (!bridgedTokenAddress) {
      return
    }

    const bridgeStartCall = {
      to: BRIDGE_AWARE_CONTRACT_ADDRESS,
      data: BridgeAwareInterface.encodeFunctionData('bridgeStart', [
        bridgedTokenAddress,
      ]),
      value: '0x00',
    }

    if (
      allTransactions.some(
        (tx) => tx.to === bridgeStartCall.to && tx.data === bridgeStartCall.data
      )
    ) {
      // the bridgeStart() call already exists in the batch, so this translation was already applied and should not be applied again
      return undefined
    }

    return [transaction, bridgeStartCall]
  },
} satisfies TransactionTranslation
