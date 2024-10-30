import { beforeEach, vi } from 'vitest'
import { chrome as chromeMock } from 'vitest-chrome'

const setPanelBehavior = vi.fn()

Object.assign(chromeMock, {
  ...chromeMock,
  sidePanel: {
    setPanelBehavior,
  },
})

beforeEach(() => setPanelBehavior.mockResolvedValue(null))

Object.assign(global, { chrome: chromeMock })
