import { captureLastError } from '@/sentry'
import { removeCSPHeaderRule } from './cspHeaderRule'

export const removeAllRpcRedirectRules = async (forkUrl?: string) => {
  await removeCSPHeaderRule()

  const { promise, resolve } = Promise.withResolvers<void>()

  chrome.declarativeNetRequest.getSessionRules((rules) => {
    const removeRuleIds = rules.reduce<number[]>((result, rule) => {
      if (
        rule.action.type ===
        chrome.declarativeNetRequest.RuleActionType.REDIRECT
      ) {
        if (forkUrl != null) {
          if (rule.action.redirect?.url === forkUrl) {
            return [...result, rule.id]
          }

          return result
        }

        return [...result, rule.id]
      }

      return result
    }, [])

    chrome.declarativeNetRequest.updateSessionRules(
      {
        removeRuleIds,
      },
      () => {
        captureLastError()

        chrome.declarativeNetRequest.getSessionRules((rules) => {
          console.debug('RPC redirect rules updated', rules)

          resolve()
        })
      },
    )
  })

  return promise
}
