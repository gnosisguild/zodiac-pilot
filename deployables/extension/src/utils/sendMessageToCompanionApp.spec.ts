import { mockCompanionAppUrl } from '@/test-utils'
import { getCompanionAppUrl } from '@zodiac/env'
import { CompanionResponseMessageType } from '@zodiac/messages'
import { mockTab } from '@zodiac/test-utils/chrome'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendMessageToCompanionApp } from './sendMessageToCompanionApp'
import { sendMessageToTab } from './sendMessageToTab'

vi.mock('./sendMessageToTab', () => ({
  sendMessageToTab: vi.fn(),
}))

describe('Send message to companion app', () => {
  const now = new Date()

  beforeEach(() => {
    mockCompanionAppUrl('http://companion-app.com')
  })

  it('sends a message to the respective tab', async () => {
    const tab = mockTab({ url: getCompanionAppUrl() })

    await sendMessageToCompanionApp(tab.id, {
      type: CompanionResponseMessageType.PONG,
      lastTransactionExecutedAt: now.toISOString(),
    })

    expect(sendMessageToTab).toHaveBeenCalledWith(tab.id, {
      type: CompanionResponseMessageType.PONG,
      lastTransactionExecutedAt: now.toISOString(),
    })
  })

  it('does nothing when the given tab is not the companion app', async () => {
    const tab = mockTab({ url: 'http://some-other-site' })

    await sendMessageToCompanionApp(tab.id, {
      type: CompanionResponseMessageType.PONG,
      lastTransactionExecutedAt: now.toISOString(),
    })

    expect(sendMessageToTab).not.toHaveBeenCalled()
  })
})
