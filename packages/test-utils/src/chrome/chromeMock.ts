import { type MockedFunction, vi } from 'vitest'
import { chrome as vitestChrome } from 'vitest-chrome'

type ChromeMock = typeof vitestChrome & {
  scripting: {
    executeScript: MockedFunction<(typeof chrome.scripting)['executeScript']>
  }

  declarativeNetRequest: Pick<
    typeof chrome.declarativeNetRequest,
    'RuleActionType' | 'HeaderOperation' | 'ResourceType'
  > & {
    updateSessionRules: MockedFunction<
      (typeof chrome.declarativeNetRequest)['updateSessionRules']
    >
    getSessionRules: MockedFunction<
      (typeof chrome.declarativeNetRequest)['getSessionRules']
    >
  }

  sidePanel: {
    open: MockedFunction<(typeof chrome.sidePanel)['open']>
    setOptions: MockedFunction<(typeof chrome.sidePanel)['setOptions']>
    setPanelBehavior: MockedFunction<
      (typeof chrome.sidePanel)['setPanelBehavior']
    >
  }

  action: {
    setBadgeText: MockedFunction<(typeof chrome.action)['setBadgeText']>
  }

  tabs: {
    // augment "get" with a very generic signature so that we can mock
    // the promise return case better
    get: MockedFunction<(typeof chrome.tabs)['get'] | ((tabId: number) => any)>
    // augment "sendMessage" with a very generic signature so that we can mock
    // the promise return case better
    sendMessage: MockedFunction<
      | (typeof chrome.tabs)['sendMessage']
      | ((tabId: number, message: unknown) => any)
    >
    remove: MockedFunction<(typeof chrome.tabs)['remove']>
  }
}

Object.assign(vitestChrome.storage.sync, {
  ...vitestChrome.storage.sync,
  onChanged: { addListener: vi.fn() },
})

enum RuleActionType {
  BLOCK = 'block',
  REDIRECT = 'redirect',
  ALLOW = 'allow',
  UPGRADE_SCHEME = 'upgradeScheme',
  MODIFY_HEADERS = 'modifyHeaders',
  ALLOW_ALL_REQUESTS = 'allowAllRequests',
}

enum HeaderOperation {
  APPEND = 'append',
  SET = 'set',
  REMOVE = 'remove',
}

enum ResourceType {
  MAIN_FRAME = 'main_frame',
  SUB_FRAME = 'sub_frame',
  STYLESHEET = 'stylesheet',
  SCRIPT = 'script',
  IMAGE = 'image',
  FONT = 'font',
  OBJECT = 'object',
  XMLHTTPREQUEST = 'xmlhttprequest',
  PING = 'ping',
  CSP_REPORT = 'csp_report',
  MEDIA = 'media',
  WEBBUNDLE = 'webbundle',
  WEBSOCKET = 'websocket',
  WEBTRANSPORT = 'webtransport',
  OTHER = 'other',
}

const vitestChromeWithMissingMethods = Object.assign(vitestChrome, {
  ...vitestChrome,

  declarativeNetRequest: {
    RuleActionType,
    HeaderOperation,
    ResourceType,

    updateSessionRules: vi.fn((_, callback: unknown) => {
      if (typeof callback === 'function') {
        callback()

        return
      }

      return Promise.resolve()
    }),
    getSessionRules: vi.fn(
      (callback): void | Promise<chrome.declarativeNetRequest.Rule[]> => {
        if (typeof callback === 'function') {
          callback()

          return
        }

        return Promise.resolve([])
      },
    ),
  },

  scripting: {
    executeScript: vi.fn(),
  },

  sidePanel: {
    open: vi.fn(),
    setOptions: vi.fn(),
    setPanelBehavior: vi.fn(),
  },

  action: {
    setBadgeText: vi.fn(),
  },

  tabs: {
    ...vitestChrome.tabs,

    remove: vi.fn(),
  },
})

export const chromeMock: ChromeMock = vitestChromeWithMissingMethods
