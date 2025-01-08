import { describe, expect, it } from 'vitest'
import { getCurrentPath } from './getCurrentPath'

describe('getCurrentPath', () => {
  it('is possible to append string values', () => {
    expect(getCurrentPath('/path', { key: 'value' })).toEqual('/path?key=value')
  })
})
