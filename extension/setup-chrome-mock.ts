import { vi } from 'vitest'
import { chrome } from 'vitest-chrome'

Object.assign(chrome.storage.sync, {
  ...chrome.storage.sync,
  onChanged: { addListener: vi.fn() },
})

Object.assign(global, { chrome })
