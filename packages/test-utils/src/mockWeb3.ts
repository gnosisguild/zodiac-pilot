import { mock, trigger } from '@depay/web3-mock'
import type { ChainId } from 'ser-kit'

type MockOptions = { accounts: string[] }

export const defaultMockAccount = '0x1000000000000000000000000000000000000000'

export const mockWeb3 = async (
  { accounts }: MockOptions = { accounts: [defaultMockAccount] },
) => {
  mock({
    blockchain: 'ethereum',
    accounts: { return: accounts },
    wallet: 'metamask',
  })

  return {
    lockWallet() {
      return trigger('accountsChanged', [])
    },
    loadAccounts(accounts: string[]) {
      return trigger('accountsChanged', accounts)
    },
    switchChain(chainId: ChainId) {
      return trigger('chainChanged', `0x${chainId}`)
    },
  }
}
