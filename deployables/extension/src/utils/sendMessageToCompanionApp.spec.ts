import { getCompanionAppUrl } from '@zodiac/env'
import { CompanionResponseMessageType } from '@zodiac/messages'
import { mockTab } from '@zodiac/test-utils/chrome'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendMessageToCompanionApp } from './sendMessageToCompanionApp'
import { sendMessageToTab } from './sendMessageToTab'

vi.mock('./sendMessageToTab', () => ({
  sendMessageToTab: vi.fn(),
}))

vi.mock('@zodiac/env', async (importOriginal) => {
  const module = await importOriginal<typeof import('@zodiac/env')>()

  return {
    ...module,

    getCompanionAppUrl: vi.fn(),
  }
})

const mockGetCompanionAppUrl = vi.mocked(getCompanionAppUrl)

describe('Send message to companion app', () => {
  beforeEach(() => {
    mockGetCompanionAppUrl.mockReturnValue('http://companion-app.com')
  })

  it('sends a message to the respective tab', async () => {
    const tab = mockTab({ url: getCompanionAppUrl() })

    await sendMessageToCompanionApp(tab.id, {
      type: CompanionResponseMessageType.PONG,
    })

    expect(sendMessageToTab).toHaveBeenCalledWith(tab.id, {
      type: CompanionResponseMessageType.PONG,
    })
  })

  it('does nothing when the given tab is not the companion app', async () => {
    const tab = mockTab({ url: 'http://some-other-site' })

    await sendMessageToCompanionApp(tab.id, {
      type: CompanionResponseMessageType.PONG,
    })

    expect(sendMessageToTab).not.toHaveBeenCalled()
  })
})
