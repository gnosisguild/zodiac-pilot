import SafeServiceClient from '@gnosis.pm/safe-service-client'

export function waitForMultisigExecution(
  chainId: number,
  safeTxHash: string
): Promise<string> {
  // TODO pass different URLs according to chainId
  const safeService = new SafeServiceClient(
    'https://safe-transaction.rinkeby.gnosis.io'
  )

  return new Promise((resolve, reject) => {
    function tryAgain() {
      setTimeout(() => {
        poll()
      }, 2000)
    }

    async function poll() {
      console.log('POLLL - calling for ', safeTxHash)
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
        console.log(e)
        return tryAgain()
      }

      const { isExecuted, isSuccessful, transactionHash } =
        safeMultisigTxResponse

      console.log(
        'POLLL - for ',
        safeTxHash,
        ' ',
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
