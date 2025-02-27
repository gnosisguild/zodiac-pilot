import { chromeMock } from '@/test-utils'
import { Chain } from '@zodiac/chains'
import { describe, expect, it } from 'vitest'
import { createRedirectRule } from './createRedirectRule'
import { addRpcRedirectRules, removeAllRpcRedirectRules } from './rpcRedirect'
import type { Fork } from './types'

describe('RPC redirects', () => {
  const redirectUrl = 'https://test-rpc.com'

  const fork: Fork = {
    chainId: Chain.ETH,
    rpcUrl: redirectUrl,
  }

  describe('Add rules', () => {
    it('creates a rule for a tab', async () => {
      const tabId = 1

      await addRpcRedirectRules(
        fork,
        new Map<number, Set<string>>().set(
          tabId,
          new Set<string>().add('http://real-url.com'),
        ),
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
        new Map<number, Set<string>>().set(
          tabId,
          new Set<string>()
            .add('http://real-url.com')
            .add('http://another-real-url.com'),
        ),
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
        new Map<number, Set<string>>()
          .set(
            1,
            new Set<string>()
              .add('http://real-url.com')
              .add('http://another-real-url.com'),
          )
          .set(2, new Set<string>().add('http://real-url.com')),
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

  describe('Remove rules', () => {
    it('Removes all redirect rules for a fork', async () => {
      await addRpcRedirectRules(
        { chainId: Chain.ETH, rpcUrl: 'http://fork-url.com' },
        new Map<number, Set<string>>().set(
          1,
          new Set<string>().add('http://rpc.com'),
        ),
      )

      await addRpcRedirectRules(
        { chainId: Chain.ETH, rpcUrl: 'http://another-fork-url.com' },
        new Map<number, Set<string>>().set(
          1,
          new Set<string>().add('http://rpc.com'),
        ),
      )

      await removeAllRpcRedirectRules('http://fork-url.com')

      const rules = await chromeMock.declarativeNetRequest.getSessionRules()

      expect(rules).toHaveLength(1)
    })
  })
})
