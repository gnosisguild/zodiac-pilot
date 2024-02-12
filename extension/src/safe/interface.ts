import { Interface } from '@ethersproject/abi'

export const safeInterface = new Interface([
  'function execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures) returns (bool success)',
  'function changeThreshold(uint256 _threshold)',
  'function addOwnerWithThreshold(address owner, uint256 _threshold)',
  'function getMessageHashForSafe(address safe, bytes message) view returns (bytes32)',
])
