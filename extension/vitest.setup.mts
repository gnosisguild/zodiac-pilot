import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { chrome } from 'vitest-chrome'

window.document.body.innerHTML = '<div id="root"></div>'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

Object.assign(chrome.storage.sync, {
  ...chrome.storage.sync,
  onChanged: { addListener: vi.fn() },
})

Object.assign(global, { chrome })
