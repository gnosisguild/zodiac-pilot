import EthersAdapter from '@safe-global/safe-ethers-lib'
import SafeServiceClient from '@safe-global/safe-service-client'
import { ethers, providers } from 'ethers'
import { useEffect, useState } from 'react'

import { ChainId } from '../networks'
import { useConnection } from '../settings'
import { Eip1193Provider } from '../types'
import { validateAddress } from '../utils'

const TX_SERVICE_URL: Record<ChainId, string | undefined> = {
  [1]: 'https://safe-transaction-mainnet.safe.global',
  [4]: 'https://safe-transaction-rinkeby.safe.global',
  [5]: 'https://safe-transaction-goerli.safe.global',
  [10]: 'https://safe-transaction-optimism.safe.global',
  [56]: 'https://safe-transaction-bsc.safe.global',
  [100]: 'https://safe-transaction-gnosis-chain.safe.global',
  [137]: 'https://safe-transaction-polygon.safe.global',
  [246]: 'https://safe-transaction-ewc.safe.global',
  [42161]: 'https://safe-transaction-arbitrum.safe.global',
  [42220]: undefined, // not available
  [73799]: 'https://safe-transaction-volta.safe.global',
  [80001]: undefined, // not available
}

export function waitForMultisigExecution(
  provider: Eip1193Provider,
  chainId: number,
  safeTxHash: string
): Promise<string> {
  const txServiceUrl = TX_SERVICE_URL[chainId as ChainId]
  if (!txServiceUrl) {
    throw new Error(`service not available for chain #${chainId}`)
  }

  const web3Provider = new providers.Web3Provider(provider)

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: web3Provider,
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

export const useSafesWithOwner = (ownerAddress: string) => {
  const { provider, connected, chainId } = useConnection()

  const [loading, setLoading] = useState(false)
  const [safes, setSafes] = useState<string[]>([])

  const checksumOwnerAddress = validateAddress(ownerAddress)

  useEffect(() => {
    if (!connected || !chainId || !checksumOwnerAddress) return

    const txServiceUrl = TX_SERVICE_URL[chainId as ChainId]
    if (!txServiceUrl) {
      throw new Error(`service not available for chain #${chainId}`)
    }
    const web3Provider = new providers.Web3Provider(provider)

    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: web3Provider,
    })

    const safeService = new SafeServiceClient({ txServiceUrl, ethAdapter })

    setLoading(true)
    let canceled = false

    safeService
      .getSafesByOwner(checksumOwnerAddress)
      .then((res) => {
        if (!canceled) {
          setSafes(res.safes)
        }
      })
      .catch((e) => {
        console.error(`Error fetching safes for ${checksumOwnerAddress}`, e)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      setLoading(false)
      setSafes([])
      canceled = true
    }
  }, [provider, checksumOwnerAddress, connected, chainId])

  return { loading, safes }
}

export const useSafeDelegates = (safeAddress: string) => {
  const { provider, connected, chainId } = useConnection()

  const [loading, setLoading] = useState(false)
  const [delegates, setDelegates] = useState<string[]>([])

  const checksumSafeAddress = validateAddress(safeAddress)

  useEffect(() => {
    if (!connected || !chainId || !checksumSafeAddress) return
    const txServiceUrl = TX_SERVICE_URL[chainId as ChainId]
    if (!txServiceUrl) {
      throw new Error(`service not available for chain #${chainId}`)
    }
    const web3Provider = new providers.Web3Provider(provider)

    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: web3Provider,
    })

    const safeService = new SafeServiceClient({ txServiceUrl, ethAdapter })

    setLoading(true)
    let canceled = false

    safeService
      .getSafeDelegates(checksumSafeAddress)
      .then((res) => {
        if (!canceled) {
          setDelegates(res.results.map((delegate) => delegate.delegate))
        }
      })
      .catch((e) => {
        console.error(`Error fetching delegates for ${checksumSafeAddress}`, e)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      setLoading(false)
      setDelegates([])
      canceled = true
    }
  }, [provider, checksumSafeAddress, connected, chainId])

  return { loading, delegates }
}
