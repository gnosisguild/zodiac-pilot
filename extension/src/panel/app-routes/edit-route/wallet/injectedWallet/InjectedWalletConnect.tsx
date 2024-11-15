import { Button } from '@/components'
import { useInjectedWallet } from '@/providers'
import { ProviderType } from '@/types'
import { ChainId } from 'ser-kit'
import { ProviderLogo } from '../providerLogo'

type InjectedWalletProps = {
  onConnect: (chainId: ChainId, account: string) => void
}

export const InjectedWalletConnect = ({ onConnect }: InjectedWalletProps) => {
  const injectedWallet = useInjectedWallet()

  if (injectedWallet.provider == null) {
    return null
  }

  return (
    <Button
      fluid
      disabled={injectedWallet.connected === false}
      onClick={async () => {
        const { chainId, accounts } = await injectedWallet.connect({
          force: true,
        })

        onConnect(chainId as ChainId, accounts[0])
      }}
    >
      <ProviderLogo providerType={ProviderType.InjectedWallet} />
      Connect with MetaMask
    </Button>
  )
}
