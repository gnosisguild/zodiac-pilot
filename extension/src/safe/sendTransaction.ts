import Safe from '@safe-global/safe-core-sdk'
import EthersAdapter from '@safe-global/safe-ethers-lib'
import ethers, { BigNumber, providers } from 'ethers'
import { getAddress } from 'ethers/lib/utils'
import { MetaTransaction } from 'react-multisend'

import { Connection, Eip1193Provider, TransactionData } from '../types'

import { initSafeServiceClient } from './initSafeServiceClient'
import { waitForMultisigExecution } from './waitForMultisigExecution'

export const sendTransaction = async (
  provider: Eip1193Provider,
  connection: Connection,
  request: MetaTransaction | TransactionData
) => {
  const web3Provider = new providers.Web3Provider(provider)
  const safeServiceClient = initSafeServiceClient(provider, connection.chainId)
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: web3Provider.getSigner(),
  })
  const safeSdk = await Safe.create({
    ethAdapter,
    safeAddress: connection.avatarAddress,
  })

  const nonce = await safeServiceClient.getNextNonce(
    getAddress(connection.avatarAddress)
  )

  const safeTransaction = await safeSdk.createTransaction({
    safeTransactionData: {
      to: getAddress(request.to || ZERO_ADDRESS),
      value: BigNumber.from(request.value || 0).toString(),
      data: request.data || '0x00',
      operation: ('operation' in request && request.operation) || 0,
      nonce,
    },
  })
  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction)
  const senderSignature = await safeSdk.signTransactionHash(safeTxHash)

  await safeServiceClient.proposeTransaction({
    safeAddress: getAddress(connection.avatarAddress),
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: getAddress(connection.pilotAddress),
    senderSignature: senderSignature.data,
    origin: 'Zodiac Pilot',
  })

  return await waitForMultisigExecution(
    provider,
    connection.chainId,
    safeTxHash
  )
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
