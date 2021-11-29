import { Interface } from '@ethersproject/abi'
import { ITxData } from '@walletconnect/types'

const AvatarInterface = new Interface([
  'function execTransactionFromModule(address to, uint256 value, bytes memory data, uint8 operation) returns (bool success)',
])

export function wrapRequest(
  request: ITxData,
  from: string,
  targetModule: string
): ITxData {
  const data = AvatarInterface.encodeFunctionData(
    'execTransactionFromModule(address,uint256,bytes,uint8)',
    [request.to, request.value, request.data, 0]
  )

  return {
    from,
    to: targetModule,
    data: data,
    value: '0x0',
  }
}
