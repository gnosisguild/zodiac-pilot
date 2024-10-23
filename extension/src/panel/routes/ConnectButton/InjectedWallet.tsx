import { Button } from '@/components'
import { ChainId } from 'ser-kit'
import { ProviderType } from '../../../types'
import { useInjectedWallet } from '../../providers'
import { ProviderLogo } from './ProviderLogo'

type InjectedWalletProps = {
  onConnect: (chainId: ChainId, account: string) => void
}

export const InjectedWallet = ({ onConnect }: InjectedWalletProps) => {
  const injectedWallet = useInjectedWallet()

  if (injectedWallet.provider == null) {
    return null
  }

  return (
    <Button
      disabled={injectedWallet.connected === false}
      onClick={async () => {
        const { chainId, accounts } = await injectedWallet.connect()

        onConnect(chainId as ChainId, accounts[0])
      }}
    >
      <ProviderLogo providerType={ProviderType.InjectedWallet} />
      Connect with MetaMask
    </Button>
  )
}
