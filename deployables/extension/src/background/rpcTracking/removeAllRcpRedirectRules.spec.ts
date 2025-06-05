import { chromeMock } from '@/test-utils'
import { Chain } from '@zodiac/chains'
import { describe, expect, it } from 'vitest'
import { addRpcRedirectRules } from './addRcpRedirectRule'
import { removeAllRpcRedirectRules } from './removeAllRpcRedirectRules'

describe('RPC redirects', () => {
  it('Removes all redirect rules for a fork', async () => {
    await addRpcRedirectRules(
      { chainId: Chain.ETH, rpcUrl: 'http://fork-url.com' },
      new Map<string, number[]>().set('http://rpc.com', [1]),
    )

    await addRpcRedirectRules(
      { chainId: Chain.ETH, rpcUrl: 'http://another-fork-url.com' },
      new Map<string, number[]>().set('http://rpc.com', [1]),
    )

    await removeAllRpcRedirectRules('http://fork-url.com')

    const rules = await chromeMock.declarativeNetRequest.getSessionRules()

    expect(rules).toHaveLength(1)

    const [rule] = rules

    expect(rule).toMatchObject({
      action: {
        redirect: {
          url: 'http://another-fork-url.com',
        },
      },
    })
  })
})
