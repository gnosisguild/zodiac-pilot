import type { HexAddress } from '@/types'
import { SupportedZodiacModuleType } from '@zodiac/modules'
import { id, Interface } from 'ethers'
import { Waypoints } from 'lucide-react'
import type { TransactionTranslation } from './types'

const GP_V2_SETTLEMENT_ADDRESS = '0x9008d19f58aabD9ed0d60971565aa8510560ab41'
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
  '0x23da9ade38e4477b23770ded512fd37b12381fab'

const CowswapOrderSignerInterface = new Interface([
  'function signOrder(tuple(address sellToken, address buyToken, address receiver, uint256 sellAmount, uint256 buyAmount, uint32 validTo, bytes32 appData, uint256 feeAmount, bytes32 kind, bool partiallyFillable, bytes32 sellTokenBalance, bytes32 buyTokenBalance) order, uint32 validDuration, uint256 feeAmountBP)',
])

const COWSWAP_SUPPORTED_NETWORK: Record<number, string> = {
  1: 'mainnet',
  100: 'xdai',
  42161: 'arbitrum_one',
  11155111: 'sepolia',
  8453: 'base',
}

export const cowswapSetPreSignature = {
  title: 'Route through CowswapOrderSigner',
  icon: Waypoints,
  recommendedFor: [
    SupportedZodiacModuleType.ROLES_V1,
    SupportedZodiacModuleType.ROLES_V2,
  ],

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
        transaction.data,
      )
      orderUid = result[0]
    } catch {
      // not a call to setPreSignature()
      return undefined
    }

    // fetch order info from CowSwap API
    const COW_SWAP_URL = `https://api.cow.fi/${COWSWAP_SUPPORTED_NETWORK[chainId]}/api/v1/orders`
    const order: CowswapOrder = await fetch(`${COW_SWAP_URL}/${orderUid}`).then(
      (response) => response.json(),
    )

    const validDuration = order.validTo - Math.floor(Date.now() / 1000)
    const feeAmountBP = Math.ceil(
      (parseInt(order.feeAmount) / parseInt(order.sellAmount)) * 10000,
    )

    let data = ''
    try {
      data = CowswapOrderSignerInterface.encodeFunctionData('signOrder', [
        {
          ...order,
          kind: id(order.kind),
          sellTokenBalance: id(order.sellTokenBalance),
          buyTokenBalance: id(order.buyTokenBalance),
        },
        validDuration,
        feeAmountBP,
      ])
    } catch (e) {
      console.error('CowSwap setPreSignature translation error', e)
      return undefined
    }

    return [
      {
        to: COWSWAP_ORDER_SIGNER_ADDRESS,
        value: 0n,
        data: data as HexAddress,
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
