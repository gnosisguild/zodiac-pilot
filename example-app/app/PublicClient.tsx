import { useAccount } from 'wagmi'
import { Section } from './components'
import { Balance } from './transfer'
import { wethContract } from './wethContract'

export const PublicClient = () => {
  const account = useAccount()

  return (
    <Section title="Public Client">
      <Balance address={account.address} />
      <Balance address={account.address} token={wethContract} />
    </Section>
  )
}
