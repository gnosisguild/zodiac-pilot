import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import SafeServiceClient from '@gnosis.pm/safe-service-client'
import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { ethers, providers } from 'ethers'

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
  provider: WalletConnectEthereumProvider,
  safeTxHash: string
): Promise<string> {
  const txServiceUrl = TX_SERVICE_URL[`${provider.chainId}`]
  if (!txServiceUrl) {
    throw new Error(`service not available for chain #${provider.chainId}`)
  }

  const web3Provider = new providers.Web3Provider(provider)

  const ethAdapter = new EthersAdapter({
    ethers,
    signer: web3Provider.getSigner(0),
  })

  const safeService = new SafeServiceClient({ txServiceUrl, ethAdapter })

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
