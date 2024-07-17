import Safe, { buildSignatureBytes } from '@safe-global/protocol-kit'

import {
  getEip1193ReadOnlyProvider,
  getReadOnlyProvider,
} from '../../providers/readOnlyProvider'
import { LegacyConnection, Eip1193Provider, TransactionData } from '../../types'
import { initSafeApiKit } from './kits'
import { waitForMultisigExecution } from './waitForMultisigExecution'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { getAddress } from 'ethers'

export const shallExecuteDirectly = async (connection: LegacyConnection) => {
  const protocolKit = await Safe.init({
    provider: getEip1193ReadOnlyProvider(connection.chainId),
    safeAddress: connection.avatarAddress,
  })

  const threshold = await protocolKit.getThreshold()

  const provider = getReadOnlyProvider(connection.chainId)
  const pilotIsSmartAccount =
    (await provider.getCode(connection.pilotAddress)) !== '0x'

  return !connection.moduleAddress && threshold === 1 && pilotIsSmartAccount
}

export const sendTransaction = async (
  provider: Eip1193Provider,
  connection: LegacyConnection,
  request: MetaTransactionData | TransactionData
) => {
  if (connection.moduleAddress) {
    throw new Error(
      `\`sendTransaction\` must only be used for direct execution, not for execution through mods.`
    )
  }

  const safeApiKit = initSafeApiKit(connection.chainId)
  const protocolKit = await Safe.init({
    provider: provider,
    signer: connection.pilotAddress,
    safeAddress: connection.avatarAddress,
  })

  const safeTransaction = await protocolKit.createTransaction({
    transactions: [
      {
        to: getAddress(request.to || ZERO_ADDRESS),
        value: BigInt(request.value || 0).toString(),
        data: request.data || '0x00',
        operation: ('operation' in request && request.operation) || 0,
      },
    ],
  })
  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction)

  if (await shallExecuteDirectly(connection)) {
    // we execute the transaction directly. this way the pilot safe can collect signatures for the exec transaction (giving more context to co-signers) rather than for signing a meta transaction
    await protocolKit.executeTransaction(safeTransaction)
  } else {
    // more signatures are required, we only store our signature in the tx service
    await protocolKit.signTransaction(safeTransaction)
    const signature = safeTransaction.getSignature(connection.pilotAddress)
    if (!signature) throw new Error('Signature not found')

    await safeApiKit.proposeTransaction({
      safeAddress: getAddress(connection.avatarAddress),
      safeTransactionData: safeTransaction.data,
      safeTxHash,
      senderAddress: getAddress(connection.pilotAddress),
      senderSignature: buildSignatureBytes([signature]),
      origin: 'Zodiac Pilot',
    })
  }

  return await waitForMultisigExecution(connection.chainId, safeTxHash)
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
