import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { getRoleKey } from './getRoleKey'

describe('getRoleKey', () => {
  it('turns all characters to lowercase', () => {
    expect(getRoleKey('TeSt')).toEqual('test')
  })

  it('replaces whitespace with underscores', () => {
    expect(getRoleKey('test me')).toEqual('test_me')
  })

  it('removes special characters', () => {
    expect(getRoleKey('töst')).toEqual('tst')
  })

  it('does not remove numbers', () => {
    expect(getRoleKey('test 9')).toEqual('test_9')
  })

  it('cuts off strings at 32 characters', () => {
    expect(getRoleKey(faker.string.alpha(33))).toHaveLength(32)
  })
})
