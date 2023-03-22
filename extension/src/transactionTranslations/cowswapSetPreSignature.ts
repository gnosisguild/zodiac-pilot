import { Web3Provider } from '@ethersproject/providers'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { ethers } from 'ethers'

import { TransactionTranslation } from './types'

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

const provider = window.ethereum && new Web3Provider(window.ethereum)
const cowSwapFunctionSignature = 'setPreSignature(bytes,bool)'
const cowSwapEncodeFunctionSignature = ethers.utils
  .id(cowSwapFunctionSignature)
  .substring(0, 10)

export default {
  title: 'setPreSignature call',

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
    }

    return preSignature
  },
} satisfies TransactionTranslation
