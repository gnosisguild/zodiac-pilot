import { describe, expect, it } from 'vitest'
import { formData } from './formData'
import { getNumberMap } from './getNumberMap'

describe('getNumberMap', () => {
  it('maps all values to numbers', () => {
    const data = formData({ 'testMap[testField]': '2' })

    expect(getNumberMap(data, 'testMap')).toEqual({ testField: 2 })
  })

  it('omits empty values', () => {
    const data = formData({ 'testMap[testField]': '' })

    expect(getNumberMap(data, 'testMap')).toEqual({})
  })
})
