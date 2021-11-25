import { Interface } from '@ethersproject/abi'
import { TransactionRequest } from '@ethersproject/abstract-provider'
import { Signer } from 'ethers'

const AvatarInterface = new Interface([
  'function execTransactionFromModule(address to, uint256 value, bytes memory data, uint8 operation) returns (bool success)',
])

export async function wrapRequestToAvatar(
  request: TransactionRequest,
  signer: Signer
): Promise<TransactionRequest> {
  const signerAddress = await signer.getAddress()

  const data = AvatarInterface.encodeFunctionData(
    'execTransactionFromModule(address,uint256,bytes,uint8)',
    [request.to, request.value, request.data, 0]
  )

  return {
    from: signerAddress,
    to: request.from,
    data: data,
    value: '0x0',
  }
}
