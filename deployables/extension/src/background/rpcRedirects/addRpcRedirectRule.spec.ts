import { chromeMock } from '@/test-utils'
import { Chain } from '@zodiac/chains'
import { describe, expect, it } from 'vitest'
import type { Fork } from '../types'
import { addRpcRedirectRules } from './addRpcRedirectRule'
import { createRedirectRule } from './createRedirectRule'

describe('RPC redirects', () => {
  const redirectUrl = 'https://test-rpc.com'

  const fork: Fork = {
    chainId: Chain.ETH,
    rpcUrl: redirectUrl,
  }

  it('creates a rule for a tab', async () => {
    const tabId = 1

    await addRpcRedirectRules(
      fork,
      new Map<string, number[]>().set('http://real-url.com', [tabId]),
    )

    const rules = await chromeMock.declarativeNetRequest.getSessionRules()

    expect(rules).toEqual([
      await createRedirectRule({
        id: 2,
        redirectUrl,
        urlToMatch: 'http://real-url.com',
        tabIds: [tabId],
      }),
    ])
  })

  it('creates multiple rules when a tab uses multiple RPC calls', async () => {
    const tabId = 1

    await addRpcRedirectRules(
      fork,
      new Map<string, number[]>()
        .set('http://real-url.com', [tabId])
        .set('http://another-real-url.com', [tabId]),
    )

    const rules = await chromeMock.declarativeNetRequest.getSessionRules()

    expect(rules).toEqual([
      await createRedirectRule({
        id: 2,
        redirectUrl,
        urlToMatch: 'http://real-url.com',
        tabIds: [tabId],
      }),
      await createRedirectRule({
        id: 3,
        redirectUrl,
        urlToMatch: 'http://another-real-url.com',
        tabIds: [tabId],
      }),
    ])
  })

  it('groups rules based on tab ids', async () => {
    await addRpcRedirectRules(
      fork,
      new Map<string, number[]>()
        .set('http://real-url.com', [1, 2])
        .set('http://another-real-url.com', [1]),
    )

    const rules = await chromeMock.declarativeNetRequest.getSessionRules()

    expect(rules).toEqual([
      await createRedirectRule({
        id: 2,
        redirectUrl,
        urlToMatch: 'http://real-url.com',
        tabIds: [1, 2],
      }),
      await createRedirectRule({
        id: 3,
        redirectUrl,
        urlToMatch: 'http://another-real-url.com',
        tabIds: [1],
      }),
    ])
  })
})
