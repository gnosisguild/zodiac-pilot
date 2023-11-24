import { KnownContracts } from '@gnosis.pm/zodiac'
import { ethers } from 'ethers'
import { Interface } from 'ethers/lib/utils'

import { TransactionTranslation } from './types'

const GP_V2_SETTLEMENT_ADDRESS = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
const GPv2SettlementInterface = new Interface([
  {
    type: 'function',
    name: 'setPreSignature',
    constant: false,
    payable: false,
    inputs: [
      { type: 'bytes', name: 'orderUid' },
      { type: 'bool', name: 'signed' },
    ],
    outputs: [],
  },
])

const COWSWAP_ORDER_SIGNER_ADDRESS =
  '0x23dA9AdE38E4477b23770DeD512fD37b12381FAB'
const CowswapOrderSignerInterface = new Interface([
  {
    inputs: [
      {
        internalType: 'contract GPv2Signing',
        name: '_signing',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { internalType: 'contract IERC20', name: 'sellToken', type: 'address' },
      { internalType: 'contract IERC20', name: 'buyToken', type: 'address' },
      { internalType: 'uint256', name: 'sellAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'buyAmount', type: 'uint256' },
      { internalType: 'uint32', name: 'validTo', type: 'uint32' },
      { internalType: 'uint32', name: 'validDuration', type: 'uint32' },
      { internalType: 'uint256', name: 'feeAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'feeAmountBP', type: 'uint256' },
      { internalType: 'bytes32', name: 'kind', type: 'bytes32' },
      { internalType: 'bool', name: 'partiallyFillable', type: 'bool' },
      { internalType: 'bytes32', name: 'sellTokenBalance', type: 'bytes32' },
      { internalType: 'bytes32', name: 'buyTokenBalance', type: 'bytes32' },
    ],
    name: 'signOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'signing',
    outputs: [
      { internalType: 'contract GPv2Signing', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
])

const COWSWAP_SUPPORTED_NETWORK: Record<number, string> = {
  1: 'mainnet',
  5: 'goerli',
  100: 'xdai',
}

export default {
  title: 'Route through CowswapOrderSigner',

  recommendedFor: [KnownContracts.ROLES],

  translate: async (transaction, chainId) => {
    if (!COWSWAP_SUPPORTED_NETWORK[chainId]) {
      // not on a network where CowSwap is deployed
      return undefined
    }

    if (
      transaction.to.toLowerCase() !== GP_V2_SETTLEMENT_ADDRESS.toLowerCase()
    ) {
      // not a call to CowSwap
      return undefined
    }

    let orderUid: string
    try {
      const result = GPv2SettlementInterface.decodeFunctionData(
        'setPreSignature',
        transaction.data
      )
      orderUid = result[0]
    } catch (e) {
      // not a call to setPreSignature()
      return undefined
    }

    // fetch order info from CowSwap API
    const COW_SWAP_URL = `https://api.cow.fi/${COWSWAP_SUPPORTED_NETWORK[chainId]}/api/v1/orders`
    const order: CowswapOrder = await fetch(`${COW_SWAP_URL}/${orderUid}`).then(
      (response) => response.json()
    )

    const validDuration = 60 * 30 // 30 minutes
    const feeAmountBP = Math.ceil(
      (parseInt(order.feeAmount) / parseInt(order.sellAmount)) * 10000
    )

    const data = CowswapOrderSignerInterface.encodeFunctionData('signOrder', [
      order.sellToken,
      order.buyToken,
      order.sellAmount,
      order.buyAmount,
      order.validTo,
      validDuration,
      order.feeAmount,
      feeAmountBP,
      ethers.utils.id(order.kind),
      order.partiallyFillable,
      ethers.utils.id(order.sellTokenBalance),
      ethers.utils.id(order.buyTokenBalance),
    ])

    return [
      {
        to: COWSWAP_ORDER_SIGNER_ADDRESS,
        value: '0',
        data,
        operation: 1,
      },
    ]
  },
} satisfies TransactionTranslation

interface CowswapOrder {
  creationDate: Date
  owner: string
  uid: string
  availableBalance?: unknown
  executedBuyAmount: string
  executedSellAmount: string
  executedSellAmountBeforeFees: string
  executedFeeAmount: string
  invalidated: boolean
  status: string
  class: string
  settlementContract: string
  fullFeeAmount: string
  solverFee: string
  isLiquidityOrder: boolean
  sellToken: string
  buyToken: string
  receiver: string
  sellAmount: string
  buyAmount: string
  validTo: number
  appData: string
  feeAmount: string
  kind: string
  partiallyFillable: boolean
  sellTokenBalance: string
  buyTokenBalance: string
  signingScheme: string
  signature: string
}
