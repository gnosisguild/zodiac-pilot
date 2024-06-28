import { Interface } from '@ethersproject/abi'
import { useMemo } from 'react'
import { TransactionState } from '../../state'

export const useDecodedFunctionData = (transactionState: TransactionState) => {
  const { contractInfo, transaction } = transactionState
  const abi = contractInfo?.abi

  return useMemo(() => {
    if (!abi) return null

    const selector = transaction.data.slice(0, 10)
    if (selector.length !== 10) {
      return null
    }

    let contractInterface: Interface
    try {
      contractInterface = new Interface(abi)
      const functionFragment = contractInterface.getFunction(selector)
      return {
        functionFragment,
        data: contractInterface.decodeFunctionData(
          functionFragment,
          transaction.data
        ),
      }
    } catch (e) {
      console.error('Error decoding using ABI', e, { selector, abi })
      return null
    }
  }, [abi, transaction])
}
