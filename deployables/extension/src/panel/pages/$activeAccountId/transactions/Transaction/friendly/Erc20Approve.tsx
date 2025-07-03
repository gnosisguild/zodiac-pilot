import { useAccount } from '@/accounts'
import {
  translateTransaction,
  useDispatch,
  usePendingTransactions,
  useTransaction,
  type UnconfirmedTransaction,
} from '@/transactions'
import { invariant } from '@epic-web/invariant'
import { verifyHexAddress } from '@zodiac/schema'
import { useChainId } from '@zodiac/ui'
import {
  decodeFunctionData,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  parseUnits,
} from 'viem'
import { useReadContracts } from 'wagmi'
import { AddressField } from '../AddressField'
import { InplaceEditAmountField } from '../InplaceEditAmountField'

export const isApplicable = (transaction: UnconfirmedTransaction) => {
  try {
    // Try to decode the transaction data as an ERC20 approve function
    const decoded = decodeFunctionData({
      abi: erc20Abi,
      data: transaction.data,
    })

    // Check if the decoded function name is 'approve'
    return decoded.functionName === 'approve'
  } catch {
    // If decoding fails, it's not an ERC20 approve transaction
    return false
  }
}

export const Title = ({ transactionId }: { transactionId: string }) => {
  const transaction = useTransaction(transactionId)

  const decoded = decodeFunctionData({
    abi: erc20Abi,
    data: transaction.data,
  })
  invariant(
    decoded.functionName === 'approve',
    'Transaction is not an ERC20 approve',
  )
  const [spenderAddress, approvalAmount] = decoded.args

  const { symbol = 'tokens', decimals = 0 } = useTokenInfo(transaction.to)
  const truncatedSpender = `${spenderAddress.slice(0, 6)}...${spenderAddress.slice(-4)}`

  return (
    <div className="flex flex-col gap-1 overflow-hidden">
      <h5
        id={transactionId}
        className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold"
      >
        Approve {compactAmount(approvalAmount, decimals)} {symbol} to{' '}
        {truncatedSpender}
      </h5>
    </div>
  )
}

export const Body = ({ transactionId }: { transactionId: string }) => {
  const transaction = useTransaction(transactionId)
  const chainId = useChainId()

  const decoded = decodeFunctionData({
    abi: erc20Abi,
    data: transaction.data,
  })
  invariant(
    decoded.functionName === 'approve',
    'Transaction is not an ERC20 approve',
  )
  const [spenderAddress, approvalAmount] = decoded.args

  const {
    symbol = 'tokens',
    name,
    decimals = 0,
    balance,
  } = useTokenInfo(transaction.to)
  const formattedAmount = formatUnits(approvalAmount, decimals) as `${number}`
  const formattedBalance =
    balance === undefined
      ? undefined
      : (formatUnits(balance, decimals) as `${number}`)

  const dispatch = useDispatch()
  const editApprovedAmount = (amount: string) => {
    dispatch(
      translateTransaction({
        id: transaction.id,
        translations: [
          {
            ...transaction,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: 'approve',
              args: [spenderAddress, parseUnits(amount, decimals)],
            }),
          },
        ],
      }),
    )
  }

  const pendingTransactions = usePendingTransactions()

  return (
    <>
      <AddressField
        chainId={chainId}
        label="Token"
        description={name}
        address={transaction.to}
      />
      <AddressField
        chainId={chainId}
        label="Spender"
        address={verifyHexAddress(spenderAddress)}
      />
      <InplaceEditAmountField
        value={formattedAmount}
        label="Approved amount"
        description={symbol}
        recommendedValue={formattedBalance}
        recommendedDescription="Use current balance"
        disabled={pendingTransactions.length > 0}
        onChange={(ev) => {
          editApprovedAmount(ev.target.value)
        }}
      />
    </>
  )
}

const useTokenInfo = (address: `0x${string}`) => {
  const account = useAccount()

  const { data, error } = useReadContracts({
    contracts: [
      {
        address,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address,
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        address,
        abi: erc20Abi,
        functionName: 'name',
      },
      {
        address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [account.address],
      },
    ],
  })

  if (error) {
    console.error(error)
  }

  const symbol = data?.[0]?.result
  const decimals = data?.[1]?.result
  const name = data?.[2]?.result
  const balance = data?.[3]?.result

  return { symbol, decimals, name, balance }
}

const MAX_UINT256 = (1n << 256n) - 1n
const THRESHOLD = (MAX_UINT256 * 99n) / 100n

const isInfinite = (amount: bigint) => {
  return amount >= THRESHOLD
}

const compactAmount = (amount: bigint, decimals: number) => {
  if (isInfinite(amount)) {
    return '∞'
  }

  const floatAmount = parseFloat(formatUnits(amount, decimals))

  // Use Intl.NumberFormat for compact notation (1.4k, 524k, 1.5M, etc.)
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  }).format(floatAmount)
}
