import { EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'
import { Contract } from 'ethers'
import { MetaTransaction } from 'ethers-multisend'
import { hashMessage, _TypedDataEncoder, toUtf8String } from 'ethers/lib/utils'

const SIGN_MESSAGE_LIB_ADDRESS = '0xd53cd0aB83D845Ac265BE939c57F53AD838012c9'
const SIGN_MESSAGE_LIB_ABI = [
  'function signMessage(bytes calldata _data)',
  'function getMessageHash(bytes memory message) public view returns (bytes32)',
]

const signMessageLib = new Contract(
  SIGN_MESSAGE_LIB_ADDRESS,
  SIGN_MESSAGE_LIB_ABI
)

export const signMessage = (message: string): MetaTransaction => ({
  to: SIGN_MESSAGE_LIB_ADDRESS,
  data: signMessageLib.interface.encodeFunctionData('signMessage', [
    hashMessage(decode(message)),
  ]),
  value: '0',
  operation: 1,
})

export const typedDataHash = (data: EIP712TypedData): string => {
  // We need to remove EIP712Domain from the types object since ethers does not like it
  const { EIP712Domain: _, ...types } = data.types

  return _TypedDataEncoder.hash(data.domain as any, types, data.message)
}

export const signTypedData = (data: EIP712TypedData) => {
  return {
    to: SIGN_MESSAGE_LIB_ADDRESS,
    data: signMessageLib.interface.encodeFunctionData('signMessage', [
      typedDataHash(data),
    ]),
    value: '0',
    operation: 1,
  }
}

const decode = (message: string): string => {
  if (!message.startsWith('0x')) {
    return message
  }

  try {
    return toUtf8String(message)
  } catch (e) {
    return message
  }
}
