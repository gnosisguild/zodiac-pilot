import { vi } from 'vitest'
import { chrome as chromeMock } from 'vitest-chrome'

Object.assign(chromeMock.storage.sync, {
  ...chromeMock.storage.sync,
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
  WEBSOCKET = 'websocket',
  OTHER = 'other',
}

Object.assign(chromeMock, {
  ...chromeMock,
  declarativeNetRequest: {
    RuleActionType,
    HeaderOperation,
    ResourceType,

    updateSessionRules: vi.fn(),
    getSessionRules: vi.fn(),
  },
})

Object.assign(global, { chrome: chromeMock })
