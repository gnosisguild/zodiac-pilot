import { getCompanionAppUrl } from '@zodiac/env'
import type { Ref } from 'react'
import { beforeEach, vi } from 'vitest'

const urlRef: Ref<string> = { current: null }

const mockGetCompanionAppUrl = vi.mocked(getCompanionAppUrl)

beforeEach(() => {
  mockGetCompanionAppUrl.mockImplementation(() => urlRef.current ?? '')
})

export const mockCompanionAppUrl = (url: string) => {
  urlRef.current = url
}
