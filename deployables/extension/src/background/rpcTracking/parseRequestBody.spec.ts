import { describe, expect, it } from 'vitest'
import { parseRequestBody } from './parseRequestBody'

describe('parseRequestBody', () => {
  it('returns null when the body could not be decoded', async () => {
    expect(
      parseRequestBody({
        raw: [
          {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore We want this to explode
            bytes: 'Ü',
          },
        ],
      }),
    ).toBeNull()
  })
})
