import { Interface } from 'ethers'

export const safeInterface = new Interface([
  'function getMessageHashForSafe(address safe, bytes message) view returns (bytes32)',
])
