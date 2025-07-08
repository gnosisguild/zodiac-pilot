import { getCompanionAppUrl } from '@zodiac/env'
import { encode } from '@zodiac/schema'
import { getDefaultRoute } from './getDefaultRoute'
import type { TaggedAccount } from './TaggedAccount'

export const editAccount = async (windowId: number, account: TaggedAccount) => {
  const tabs = await chrome.tabs.query({ windowId })

  if (account.remote) {
    const existingTab = tabs.find(
      (tab) =>
        tab.url != null &&
        tab.url.startsWith(`${getCompanionAppUrl()}/account/${account.id}`),
    )

    if (existingTab != null && existingTab.id != null) {
      await chrome.tabs.update(existingTab.id, {
        active: true,
        url: `${getCompanionAppUrl()}/account/${account.id}`,
      })
    } else {
      await chrome.tabs.create({
        active: true,
        url: `${getCompanionAppUrl()}/account/${account.id}`,
      })
    }
  } else {
    const route = await getDefaultRoute(account.id)

    const existingTab = tabs.find(
      (tab) =>
        tab.url != null &&
        tab.url.startsWith(
          `${getCompanionAppUrl()}/offline/accounts/${account.id}`,
        ),
    )

    if (existingTab != null && existingTab.id != null) {
      await chrome.tabs.update(existingTab.id, {
        active: true,
        url: `${getCompanionAppUrl()}/offline/accounts/${account.id}/${encode(route)}`,
      })
    } else {
      await chrome.tabs.create({
        active: true,
        url: `${getCompanionAppUrl()}/offline/accounts/${account.id}/${encode(route)}`,
      })
    }
  }
}
