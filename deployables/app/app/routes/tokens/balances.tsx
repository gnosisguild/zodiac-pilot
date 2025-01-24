import { Page } from '@/components'
import { formatUnits } from 'viem'
import { useAccount, useBalance } from 'wagmi'
import type { Route } from './+types/balances'

export const meta: Route.MetaFunction = () => [{ title: 'Pilot | Balances' }]

const Balances = () => {
  return (
    <Page>
      <Page.Header>Balances</Page.Header>

      <Page.Main>
        <AccountBalance />
      </Page.Main>
    </Page>
  )
}

export default Balances

const AccountBalance = () => {
  const { address } = useAccount()
  const { data } = useBalance({ address })

  if (data == null) {
    return null
  }

  return `${formatUnits(data.value, data.decimals)} ${data.symbol}`
}
