import SafeServiceClient from '@gnosis.pm/safe-service-client'

const TX_SERVICE_URL: Record<string, string | undefined> = {
  '1': 'https://safe-transaction.gnosis.io',
  '4': 'https://safe-transaction.rinkeby.gnosis.io',
  '100': 'https://safe-transaction.xdai.gnosis.io',
  '73799': 'https://safe-transaction.volta.gnosis.io',
  '246': 'https://safe-transaction.ewc.gnosis.io',
  '137': 'https://safe-transaction.polygon.gnosis.io',
  '56': 'https://safe-transaction.bsc.gnosis.io',
  '42161': 'https://safe-transaction.arbitrum.gnosis.io',
}

export function waitForMultisigExecution(
  chainId: number,
  safeTxHash: string
): Promise<string> {
  const url = TX_SERVICE_URL[`${chainId}`]
  if (!url) {
    throw new Error(`service not available for chain #${chainId}`)
  }

  // TODO pass different URLs according to chainId
  const safeService = new SafeServiceClient(url)

  return new Promise((resolve, reject) => {
    function tryAgain() {
      setTimeout(() => {
        poll()
      }, 2000)
    }

    async function poll() {
      console.log('POLL - calling for ', safeTxHash)
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
        'POLL - for ',
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
