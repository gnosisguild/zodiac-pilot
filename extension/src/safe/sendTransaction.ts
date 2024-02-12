import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import * as ethers from 'ethers'
import { getAddress } from 'ethers/lib/utils'
import { MetaTransaction } from 'react-multisend'
import { getReadOnlyProvider } from '../providers/readOnlyProvider'

import { Connection, Eip1193Provider, TransactionData } from '../types'

import { initSafeApiKit } from './kits'
import { waitForMultisigExecution } from './waitForMultisigExecution'

export const shallExecuteDirectly = async (connection: Connection) => {
  const provider = getReadOnlyProvider(connection.chainId)
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: provider,
  })
  const safeSdk = await Safe.create({
    ethAdapter,
    safeAddress: connection.avatarAddress,
  })

  const threshold = await safeSdk.getThreshold()
  const pilotIsSmartAccount =
    (await provider.getCode(connection.pilotAddress)) !== '0x'

  return !connection.moduleAddress && threshold === 1 && pilotIsSmartAccount
}

export const sendTransaction = async (
  provider: Eip1193Provider,
  connection: Connection,
  request: MetaTransaction | TransactionData
) => {
  if (connection.moduleAddress) {
    throw new Error(
      `\`sendTransaction\` must only be used for direct execution, not for execution through mods.`
    )
  }

  const web3Provider = new ethers.providers.Web3Provider(provider)
  const safeApiKit = initSafeApiKit(connection.chainId)
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

  if (await shallExecuteDirectly(connection)) {
    // we execute the transaction directly. this way the pilot safe can collect signatures for the exec transaction (giving more context to co-signers) rather than for signing a meta transaction
    await safeSdk.executeTransaction(safeTransaction)
  } else {
    // more signatures are required, we only store our signature in the tx service
    const senderSignature = await safeSdk.signTransactionHash(safeTxHash)

    await safeApiKit.proposeTransaction({
      safeAddress: getAddress(connection.avatarAddress),
      safeTransactionData: safeTransaction.data,
      safeTxHash,
      senderAddress: getAddress(connection.pilotAddress),
      senderSignature: senderSignature.data,
      origin: 'Zodiac Pilot',
    })
  }

  return await waitForMultisigExecution(connection.chainId, safeTxHash)
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
