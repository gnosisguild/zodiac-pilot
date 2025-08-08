import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { getRoleActionKey } from './getRoleActionKey'

describe('getRoleActionKey', () => {
  it('turns all characters to lowercase', () => {
    expect(getRoleActionKey('TeSt')).toEqual('test')
  })

  it('replaces whitespace with underscores', () => {
    expect(getRoleActionKey('test me')).toEqual('test_me')
  })

  it('removes special characters', () => {
    expect(getRoleActionKey('töst')).toEqual('tst')
  })

  it('does not remove numbers', () => {
    expect(getRoleActionKey('test 9')).toEqual('test_9')
  })

  it('cuts off strings at 32 characters', () => {
    expect(getRoleActionKey(faker.string.alpha(33))).toHaveLength(32)
  })
})
