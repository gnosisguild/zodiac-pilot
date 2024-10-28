import { KnownContracts } from '@gnosis.pm/zodiac'

import { TransactionTranslation } from '../types'
import { Interface } from 'ethers'
import { extractBridgedTokenAddress } from './bridges'

const KARPATKEY_INSTITUTIONAL_AVATARS = [
  '0x846e7f810e08f1e2af2c5afd06847cc95f5cae1b',
  '0xdf8ee91120154bdc3cb628f0535b6511e52327ff',
  '0xd0ca2a7ed8aee7972750b085b27350f1cd387f9b',
].map((address) => address.toLowerCase())

const BRIDGE_AWARE_CONTRACT_ADDRESS =
  '0x36B2a59f3CDa3db1283FEBc7c228E89ecE7Db6f4'

const BridgeAwareInterface: Interface = new Interface([
  `function bridgeStart(address asset)`,
])

export default {
  title: 'Add bridgeStart call',

  recommendedFor: [KnownContracts.ROLES_V2],
  autoApply: true,

  translateGlobal: async (allTransactions, chainId, avatarAddress) => {
    if (
      !KARPATKEY_INSTITUTIONAL_AVATARS.includes(avatarAddress.toLowerCase())
    ) {
      return
    }

    const bridgedTokenAddresses = allTransactions
      .map((tx) => extractBridgedTokenAddress(tx, chainId))
      .filter(Boolean) as `0x${string}`[]

    if (bridgedTokenAddresses.length === 0) {
      return
    }

    const bridgeStartCalls = bridgedTokenAddresses.map((tokenAddress) => ({
      to: BRIDGE_AWARE_CONTRACT_ADDRESS,
      data: BridgeAwareInterface.encodeFunctionData('bridgeStart', [
        tokenAddress,
      ]),
      value: '0',
    }))

    const callsToAdd = bridgeStartCalls.filter(
      (bridgeStartCall) =>
        !allTransactions.some(
          (tx) =>
            tx.to.toLowerCase() === bridgeStartCall.to.toLowerCase() &&
            tx.data === bridgeStartCall.data
        )
    )

    if (callsToAdd.length === 0) {
      // all necessary bridgeStart() calls are already present in the batch
      return undefined
    }

    return [...allTransactions, ...bridgeStartCalls]
  },
} satisfies TransactionTranslation
