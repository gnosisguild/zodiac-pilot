import { ZERO_ADDRESS } from '@zodiac/chains'
import { verifyHexAddress, type HexAddress } from '@zodiac/schema'
import { decodeAbiParameters, type Log } from 'viem'

/**
 * Processes an array of transfer logs and updates the deltas record with the amounts transferred to the specified address.
 *
 * @param logs - An array of log objects representing transfer events.
 * @param address - The target address (avatar address) to check for incoming transfers.
 * @param deltas - A record object where the keys are token addresses and the values are the accumulated transfer amounts.
 *
 * @returns The updated deltas record with the amounts transferred to the specified address.
 */
export const processTransferLogs = (
  currentDeltas: Record<HexAddress, bigint>,
  logs: Log[],
  address: HexAddress, //avatar address
): Record<HexAddress, bigint> =>
  logs.reduce((newDeltas, log) => {
    const [topic] = log.topics

    let transfer: Transfer
    switch (topic) {
      case ERC20_TRANSFER_TOPIC:
        transfer = decodeErc20TransferLog(log)
        break
      case WETH_DEPOSIT_TOPIC:
        transfer = decodeWethDepositLog(log)
        break
      case WETH_WITHDRAWAL_TOPIC:
        transfer = decodeWethWithdrawalLog(log)
        break
      case TENDERLY_ADD_ERC20_BALANCE_TOPIC:
        transfer = decodeTenderlyAddErc20BalanceLog(log)
        break
      default:
        return newDeltas
    }

    const { from, to, value, token } = transfer
    if (to.toLowerCase() === address.toLowerCase()) {
      // Avatar receives tokens => increase delta
      return { ...newDeltas, [token]: (newDeltas[token] ?? 0n) + value }
    }

    if (from.toLowerCase() === address.toLowerCase()) {
      // Avatar sends tokens => decrease delta
      return {
        ...newDeltas,
        [token]: (newDeltas[token] ?? 0n) - value,
      }
    }

    return newDeltas
  }, currentDeltas)

export const ERC20_TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

export const WETH_DEPOSIT_TOPIC =
  '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c'

export const WETH_WITHDRAWAL_TOPIC =
  '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65'

export const TENDERLY_ADD_ERC20_BALANCE_TOPIC =
  '0x6b63b18d9192abd17d691fc20cdd4e217201dcaec063e9a17bf1b479fea63591'

type Transfer = {
  from: HexAddress
  to: HexAddress
  value: bigint
  token: HexAddress
}

const decodeErc20TransferLog = (log: Log): Transfer => {
  return {
    from: verifyHexAddress('0x' + (log.topics[1]?.slice(26) || '')),
    to: verifyHexAddress('0x' + (log.topics[2]?.slice(26) || '')),
    value: log.data === '0x' ? 0n : BigInt(log.data),
    token: verifyHexAddress(log.address),
  }
}

/// WETH deposits and withdrawals don't emit Transfer events, so we need to account for them separately.
const decodeWethDepositLog = (log: Log): Transfer => {
  return {
    from: ZERO_ADDRESS,
    to: verifyHexAddress('0x' + (log.topics[1]?.slice(26) || '')),
    value: log.data === '0x' ? 0n : BigInt(log.data),
    token: verifyHexAddress(log.address),
  }
}

const decodeWethWithdrawalLog = (log: Log): Transfer => {
  return {
    from: verifyHexAddress('0x' + (log.topics[1]?.slice(26) || '')),
    to: ZERO_ADDRESS,
    value: log.data === '0x' ? 0n : BigInt(log.data),
    token: verifyHexAddress(log.address),
  }
}

const decodeTenderlyAddErc20BalanceLog = (log: Log): Transfer => {
  const [token, , value, , to] = decodeAbiParameters(
    [
      { name: 'token', type: 'address' },
      { name: '_param1', type: 'uint256' },
      { name: 'value', type: 'uint256' },
      { name: '_param3', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    log.data,
  )

  return {
    from: ZERO_ADDRESS,
    to: verifyHexAddress(to),
    value: value,
    token: verifyHexAddress(token),
  }
}
