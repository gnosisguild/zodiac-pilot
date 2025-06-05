import { REMOVE_CSP_RULE_ID } from '../cspHeaderRule'

type RedirectRuleOptions = {
  id?: number
  redirectUrl: string
  urlToMatch: string
  tabIds: number[]
}

const nextId = async () => {
  const rules = await chrome.declarativeNetRequest.getSessionRules()

  if (rules.length === 0) {
    return REMOVE_CSP_RULE_ID + 1
  }

  const maxId = Math.max(...rules.map(({ id }) => id))

  return maxId + 1
}

export const createRedirectRule = async ({
  id,
  redirectUrl,
  urlToMatch,
  tabIds,
}: RedirectRuleOptions): Promise<chrome.declarativeNetRequest.Rule> => ({
  id: id || (await nextId()),
  priority: 1,
  action: {
    type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
    redirect: { url: redirectUrl },
  },
  condition: {
    resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
    urlFilter: urlToMatch,
    tabIds,
  },
})
