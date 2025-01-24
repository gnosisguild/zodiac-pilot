import { formatUnits } from 'viem'
import { useAccount, useBalance } from 'wagmi'

const Balances = () => {
  const { address } = useAccount()
  const { data } = useBalance({ address })

  if (data == null) {
    return null
  }

  return `${formatUnits(data.value, data.decimals)} ${data.symbol}`
}

export default Balances
