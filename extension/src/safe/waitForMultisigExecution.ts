import { ChainId } from '../networks'
import { Eip1193Provider } from '../types'

import { initSafeApiKit } from './initSafeApiKit'

export function waitForMultisigExecution(
  provider: Eip1193Provider,
  chainId: number,
  safeTxHash: string
): Promise<string> {
  const safeService = initSafeApiKit(provider, chainId as ChainId)

  return new Promise((resolve, reject) => {
    function tryAgain() {
      setTimeout(() => {
        poll()
      }, 2000)
    }

    async function poll() {
      let safeMultisigTxResponse

      // NOTE1: after pushing the approve on the wc-safe-app the record takes
      // around 5 seconds to be available on the transaction-service starts with
      // isExecuted set to false
      // NOTE2: after the multisig transaction is approved and mined, it takes
      // around an additional around 30 seconds to be reflected in the service and
      // and come out with meaningful isExecuted and isSuccessful values
      try {
        safeMultisigTxResponse = await safeService.getTransaction(safeTxHash)
      } catch (e) {
        console.log('poll error', e)
        return tryAgain()
      }

      const { isExecuted, isSuccessful, transactionHash } =
        safeMultisigTxResponse

      console.debug(
        'poll tx',
        safeTxHash,
        isExecuted,
        isSuccessful,
        transactionHash
      )

      if (isExecuted) {
        if (isSuccessful) {
          resolve(transactionHash)
        } else {
          reject('Safe Multisig Transaction Execution failed')
        }
      } else {
        tryAgain()
      }
    }

    poll()
  })
}
