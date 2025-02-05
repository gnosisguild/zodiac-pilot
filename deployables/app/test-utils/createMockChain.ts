import { chainIdSchema, type Chain as ChainType } from '@/balances-server'
import { Chain } from '@zodiac/chains'

export const createMockChain = (chain: Partial<ChainType> = {}): ChainType => ({
  id: chainIdSchema.parse('eth'),
  community_id: Chain.ETH,
  is_support_pre_exec: true,
  logo_url: null,
  name: 'Ethereum',
  native_token_id: 'eth',
  wrapped_token_id: 'weth',

  ...chain,
})
