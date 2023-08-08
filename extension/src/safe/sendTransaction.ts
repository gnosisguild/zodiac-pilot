import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import * as ethers from 'ethers'
import { getAddress } from 'ethers/lib/utils'
import { MetaTransaction } from 'react-multisend'

import { Connection, Eip1193Provider, TransactionData } from '../types'

import { initSafeApiKit } from './initSafeApiKit'
import { waitForMultisigExecution } from './waitForMultisigExecution'

export const sendTransaction = async (
  provider: Eip1193Provider,
  connection: Connection,
  request: MetaTransaction | TransactionData
) => {
  const web3Provider = new ethers.providers.Web3Provider(provider)
  const safeApiKit = initSafeApiKit(provider, connection.chainId)
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: web3Provider.getSigner(),
  })
  const safeSdk = await Safe.create({
    ethAdapter,
    safeAddress: connection.avatarAddress,
  })

  const nonce = await safeApiKit.getNextNonce(
    getAddress(connection.avatarAddress)
  )

  const safeTransaction = await safeSdk.createTransaction({
    safeTransactionData: {
      to: getAddress(request.to || ZERO_ADDRESS),
      value: ethers.BigNumber.from(request.value || 0).toString(),
      data: request.data || '0x00',
      operation: ('operation' in request && request.operation) || 0,
      nonce,
    },
  })
  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction)
  const senderSignature = await safeSdk.signTransactionHash(safeTxHash)

  await safeApiKit.proposeTransaction({
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
