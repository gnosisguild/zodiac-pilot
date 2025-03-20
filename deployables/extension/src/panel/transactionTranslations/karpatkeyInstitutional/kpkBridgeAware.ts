import type { HexAddress } from '@/types'
import { SupportedZodiacModuleType } from '@zodiac/modules'
import type { Hex } from '@zodiac/schema'
import { Interface } from 'ethers'
import { BetweenHorizontalStart } from 'lucide-react'
import type { MetaTransactionRequest } from 'ser-kit'
import type { TransactionTranslation } from '../types'
import { extractBridgedTokenAddress } from './bridges'

const KARPATKEY_INSTITUTIONAL_AVATARS = [
  '0x846e7f810e08f1e2af2c5afd06847cc95f5cae1b',
  '0xdf8ee91120154bdc3cb628f0535b6511e52327ff',
  '0xd0ca2a7ed8aee7972750b085b27350f1cd387f9b',
].map((address) => address.toLowerCase())

export const BRIDGE_AWARE_CONTRACT_ADDRESSES = [
  //mainnet
  {
    chainId: 1,
    address: '0xf0125a04d74782e6d2ad6d298f0bc786e301aac1',
  },
  //Arbitrum1
  {
    chainId: 42161,
    address: '0x4abe155c97009e388e0493fe1516f636e0f3a390',
  },
  //Optimism
  {
    chainId: 10,
    address: '0x4abe155c97009e388e0493fe1516f636e0f3a390',
  },
  //Base
  {
    chainId: 8453,
    address: '0x4abe155c97009e388e0493fe1516f636e0f3a390',
  },
  //Gnosis
  {
    chainId: 100,
    address: '0x4abe155c97009e388e0493fe1516f636e0f3a390',
  },
  //Sepolia
  {
    chainId: 11155111,
    address: '0x36b2a59f3cda3db1283febc7c228e89ece7db6f4',
  },
] as const

const BridgeAwareInterface: Interface = new Interface([
  `function bridgeStart(address asset)`,
])

export const kpkBridgeAware = {
  title: 'Add bridgeStart call',
  icon: BetweenHorizontalStart,
  recommendedFor: [SupportedZodiacModuleType.ROLES_V2],
  autoApply: true,

  translateGlobal: async (allTransactions, chainId, avatarAddress) => {
    if (
      !KARPATKEY_INSTITUTIONAL_AVATARS.includes(avatarAddress.toLowerCase())
    ) {
      return
    }

    const bridgedTokenAddresses = allTransactions
      .map((tx) => extractBridgedTokenAddress(tx, chainId))
      .filter(Boolean) as Hex[]

    if (bridgedTokenAddresses.length === 0) {
      return
    }

    const bridgeStartCalls = bridgedTokenAddresses.reduce<
      MetaTransactionRequest[]
    >((result, tokenAddress) => {
      const foundAddress = BRIDGE_AWARE_CONTRACT_ADDRESSES.find(
        (item) => item.chainId === chainId,
      )

      if (!foundAddress) {
        return result
      }

      return [
        ...result,
        {
          to: foundAddress.address,
          data: BridgeAwareInterface.encodeFunctionData('bridgeStart', [
            tokenAddress,
          ]) as HexAddress,
          value: 0n,
        },
      ]
    }, [])

    const callsToAdd = bridgeStartCalls.filter(
      (bridgeStartCall) =>
        !allTransactions.some(
          (tx) =>
            tx.to.toLowerCase() === bridgeStartCall.to.toLowerCase() &&
            tx.data === bridgeStartCall.data,
        ),
    )

    if (callsToAdd.length === 0) {
      // all necessary bridgeStart() calls are already present in the batch
      return undefined
    }

    return [...allTransactions, ...bridgeStartCalls]
  },
} satisfies TransactionTranslation
