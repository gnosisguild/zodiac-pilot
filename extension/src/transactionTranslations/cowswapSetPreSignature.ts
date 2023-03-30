import { Web3Provider } from '@ethersproject/providers'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { BigNumber, ethers } from 'ethers'

import { TransactionTranslation } from './types'

const CowswapOrderSignerContract = '0x00cD4A00784E85b6a1558777D9F62c29Dca75eAa'

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

export const COWSWAP_SUPPORTED_NETWORK: Record<number, string> = {
  1: 'mainnet',
  5: 'goerli',
  100: 'xdai',
}

const abi = [
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
]

const cowswapOrderSignerABI = [
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
]

const provider = window.ethereum && new Web3Provider(window.ethereum)
const cowSwapFunctionSignature = 'setPreSignature(bytes,bool)'
const cowSwapEncodeFunctionSignature = ethers.utils
  .id(cowSwapFunctionSignature)
  .substring(0, 10)

export default {
  title: 'Route through CowswapOrderSigner',

  recommendedFor: [KnownContracts.ROLES],

  translate: async (transaction) => {
    let preSignature = undefined

    if (!transaction.data) {
      return undefined
    }

    if (provider) {
      const chainId = provider.network.chainId
      const iface = new ethers.utils.Interface(abi)
      const transactionDecoded = iface.parseTransaction({
        data: transaction.data,
        value: transaction.value,
      })
      if (transactionDecoded.sighash === cowSwapEncodeFunctionSignature) {
        const cowSwapInputValues = iface.decodeFunctionData(
          cowSwapFunctionSignature,
          transaction.data
        )
        if (cowSwapInputValues.length) {
          const orderUid = cowSwapInputValues[0]
          if (orderUid && chainId) {
            try {
              const COW_SWAP_URL = `https://api.cow.fi/${COWSWAP_SUPPORTED_NETWORK[chainId]}/api/v1/orders`
              await fetch(`${COW_SWAP_URL}/${orderUid}`) //api for the get request
                .then((response) => response.json())
                .then(async (data: CowswapOrder) => {
                  let encodedFunctionData
                  const cowswapOrder = {
                    sellToken: data.sellToken,
                    buyToken: data.buyToken,
                    sellAmount: BigNumber.from(data.sellAmount),
                    buyAmount: BigNumber.from(data.buyAmount),
                    validTo: Math.floor(Date.now() / 1000),
                    validDuration: 60 * 30, // 30 minutes
                    feeAmount: BigNumber.from(data.feeAmount),
                    feeAmountBP: Math.ceil(
                      (parseInt(data.feeAmount) / parseInt(data.sellAmount)) *
                        10000
                    ),
                    kind: ethers.utils.id(data.kind),
                    partiallyFillable: data.partiallyFillable,
                    sellTokenBalance: ethers.utils.id(data.sellTokenBalance),
                    buyTokenBalance: ethers.utils.id(data.buyTokenBalance),
                  }

                  const contract = new ethers.Contract(
                    CowswapOrderSignerContract,
                    cowswapOrderSignerABI,
                    provider
                  )

                  try {
                    encodedFunctionData = contract.interface.encodeFunctionData(
                      'signOrder',
                      [
                        cowswapOrder.sellToken,
                        cowswapOrder.buyToken,
                        cowswapOrder.sellAmount,
                        cowswapOrder.buyAmount,
                        cowswapOrder.validTo,
                        cowswapOrder.validDuration,
                        cowswapOrder.feeAmount,
                        cowswapOrder.feeAmountBP,
                        cowswapOrder.kind,
                        cowswapOrder.partiallyFillable,
                        cowswapOrder.sellTokenBalance,
                        cowswapOrder.buyTokenBalance,
                      ]
                    )
                  } catch (e) {
                    throw new Error(`Error: (${e})`)
                  }
                  if (encodedFunctionData) {
                    preSignature = [
                      {
                        to: CowswapOrderSignerContract,
                        value: 0,
                        data: encodedFunctionData,
                        operation: 1,
                      },
                    ]
                  }
                })
            } catch (e) {
              throw new Error(`Error fetching the ${orderUid} from cowswap API`)
            }
          }
        }
      }
    }

    return preSignature
  },
} satisfies TransactionTranslation
