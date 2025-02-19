import { CompanionAppMessageType } from '@zodiac/messages'
import { randomUUID } from 'crypto'
import { describe, expect, it, vi } from 'vitest'

describe('Fork info', () => {
  const importModule = () =>
    vi.importActual<typeof import('./fork-support')>(
      `./fork-support?bust=${randomUUID()}`,
    )

  it('requests fork info directly on script load', async () => {
    await importModule()

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: CompanionAppMessageType.REQUEST_FORK_INFO,
    })
  })
})
