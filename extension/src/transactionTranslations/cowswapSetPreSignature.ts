import { KnownContracts } from '@gnosis.pm/zodiac'
import { Interface } from 'ethers/lib/utils'
import { TransactionTranslation } from './types'
import { getDefaultProvider } from '@ethersproject/providers'
import { ethers } from 'ethers'
// import { CowSwap } from '@cowprotocol/cow-sdk'

export const COWSWAP_SUPPORTED_NETWORK: Record<number, string> = {
  1: 'mainnet',
  5: 'goerli',
  100: 'xdai',
}

const API_URL = `https://api.cow.fi/`

const abi = [
  {
    type: 'constructor',
    payable: false,
    inputs: [
      { type: 'address', name: 'authenticator_' },
      { type: 'address', name: 'vault_' },
    ],
  },
  {
    type: 'event',
    anonymous: false,
    name: 'Interaction',
    inputs: [
      { type: 'address', name: 'target', indexed: true },
      { type: 'uint256', name: 'value', indexed: false },
      { type: 'bytes4', name: 'selector', indexed: false },
    ],
  },
  {
    type: 'event',
    anonymous: false,
    name: 'OrderInvalidated',
    inputs: [
      { type: 'address', name: 'owner', indexed: true },
      { type: 'bytes', name: 'orderUid', indexed: false },
    ],
  },
  {
    type: 'event',
    anonymous: false,
    name: 'PreSignature',
    inputs: [
      { type: 'address', name: 'owner', indexed: true },
      { type: 'bytes', name: 'orderUid', indexed: false },
      { type: 'bool', name: 'signed', indexed: false },
    ],
  },
  {
    type: 'event',
    anonymous: false,
    name: 'Settlement',
    inputs: [{ type: 'address', name: 'solver', indexed: true }],
  },
  {
    type: 'event',
    anonymous: false,
    name: 'Trade',
    inputs: [
      { type: 'address', name: 'owner', indexed: true },
      { type: 'address', name: 'sellToken', indexed: false },
      { type: 'address', name: 'buyToken', indexed: false },
      { type: 'uint256', name: 'sellAmount', indexed: false },
      { type: 'uint256', name: 'buyAmount', indexed: false },
      { type: 'uint256', name: 'feeAmount', indexed: false },
      { type: 'bytes', name: 'orderUid', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'authenticator',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'domainSeparator',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [],
    outputs: [{ type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'filledAmount',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [{ type: 'bytes' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'freeFilledAmountStorage',
    constant: false,
    payable: false,
    inputs: [{ type: 'bytes[]', name: 'orderUids' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'freePreSignatureStorage',
    constant: false,
    payable: false,
    inputs: [{ type: 'bytes[]', name: 'orderUids' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getStorageAt',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      { type: 'uint256', name: 'offset' },
      { type: 'uint256', name: 'length' },
    ],
    outputs: [{ type: 'bytes' }],
  },
  {
    type: 'function',
    name: 'invalidateOrder',
    constant: false,
    payable: false,
    inputs: [{ type: 'bytes', name: 'orderUid' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'preSignature',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [{ type: 'bytes' }],
    outputs: [{ type: 'uint256' }],
  },
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
  {
    type: 'function',
    name: 'settle',
    constant: false,
    payable: false,
    inputs: [
      { type: 'address[]', name: 'tokens' },
      { type: 'uint256[]', name: 'clearingPrices' },
      {
        type: 'tuple[]',
        name: 'trades',
        components: [
          { type: 'uint256', name: 'sellTokenIndex' },
          { type: 'uint256', name: 'buyTokenIndex' },
          { type: 'address', name: 'receiver' },
          { type: 'uint256', name: 'sellAmount' },
          { type: 'uint256', name: 'buyAmount' },
          { type: 'uint32', name: 'validTo' },
          { type: 'bytes32', name: 'appData' },
          { type: 'uint256', name: 'feeAmount' },
          { type: 'uint256', name: 'flags' },
          { type: 'uint256', name: 'executedAmount' },
          { type: 'bytes', name: 'signature' },
        ],
      },
      {
        type: 'tuple[][3]',
        name: 'interactions',
        components: [
          { type: 'address', name: 'target' },
          { type: 'uint256', name: 'value' },
          { type: 'bytes', name: 'callData' },
        ],
      },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'simulateDelegatecall',
    constant: false,
    payable: false,
    inputs: [
      { type: 'address', name: 'targetContract' },
      { type: 'bytes', name: 'calldataPayload' },
    ],
    outputs: [{ type: 'bytes', name: 'response' }],
  },
  {
    type: 'function',
    name: 'simulateDelegatecallInternal',
    constant: false,
    payable: false,
    inputs: [
      { type: 'address', name: 'targetContract' },
      { type: 'bytes', name: 'calldataPayload' },
    ],
    outputs: [{ type: 'bytes', name: 'response' }],
  },
  {
    type: 'function',
    name: 'swap',
    constant: false,
    payable: false,
    inputs: [
      {
        type: 'tuple[]',
        name: 'swaps',
        components: [
          { type: 'bytes32', name: 'poolId' },
          { type: 'uint256', name: 'assetInIndex' },
          { type: 'uint256', name: 'assetOutIndex' },
          { type: 'uint256', name: 'amount' },
          { type: 'bytes', name: 'userData' },
        ],
      },
      { type: 'address[]', name: 'tokens' },
      {
        type: 'tuple',
        name: 'trade',
        components: [
          { type: 'uint256', name: 'sellTokenIndex' },
          { type: 'uint256', name: 'buyTokenIndex' },
          { type: 'address', name: 'receiver' },
          { type: 'uint256', name: 'sellAmount' },
          { type: 'uint256', name: 'buyAmount' },
          { type: 'uint32', name: 'validTo' },
          { type: 'bytes32', name: 'appData' },
          { type: 'uint256', name: 'feeAmount' },
          { type: 'uint256', name: 'flags' },
          { type: 'uint256', name: 'executedAmount' },
          { type: 'bytes', name: 'signature' },
        ],
      },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'vault',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'vaultRelayer',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [],
    outputs: [{ type: 'address' }],
  },
]
const provider = getDefaultProvider()
const cowSwapFunctionSignature = 'setPreSignature(bytes,bool)'
const cowSwapEncodeFunctionSignature = ethers.utils
  .id(cowSwapFunctionSignature)
  .substring(0, 10)

export default {
  title: 'setPreSignature call',

  recommendedFor: [KnownContracts.ROLES],

  translate: async (transaction) => {
    let preSignature = undefined
    const { chainId } = await provider.getNetwork()
    const COW_SWAP_URL = `${API_URL}/${COWSWAP_SUPPORTED_NETWORK[chainId]}/api/v1/orders`
    if (!transaction.data) {
      return undefined
    }

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
        if (orderUid) {
          try {
            await fetch(`${COW_SWAP_URL}/${orderUid}`) //api for the get request
              .then((response) => response.json())
              .then((data) => {
                if (data.status === 'presignaturePending') {
                  preSignature = [
                    {
                      ...transaction,
                      value: transaction.value,
                      data: transaction.data,
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

    return preSignature
  },
} satisfies TransactionTranslation
