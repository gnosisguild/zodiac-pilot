import { chromeMock } from './chromeMock'

export const createSessionRulesMock = () => {
  const rules = new Map<number, chrome.declarativeNetRequest.Rule>()

  chromeMock.declarativeNetRequest.updateSessionRules.mockImplementation(
    ({ addRules = [], removeRuleIds = [] }, callback?: () => void) => {
      removeRuleIds.forEach((ruleId) => rules.delete(ruleId))

      addRules.forEach((rule) => rules.set(rule.id, rule))

      if (callback != null) {
        callback()
      }

      return Promise.resolve()
    },
  )

  chromeMock.declarativeNetRequest.getSessionRules.mockImplementation(
    (callback?: (rules: chrome.declarativeNetRequest.Rule[]) => void) => {
      if (callback != null) {
        callback(Array.from(rules.values()))
      }

      return Promise.resolve<chrome.declarativeNetRequest.Rule[]>(
        Array.from(rules.values()),
      )
    },
  )
}
