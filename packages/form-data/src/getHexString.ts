import { verifyHexAddress } from '@zodiac/schema'
import { getOptionalString } from './getOptionalString'
import { getString } from './getString'

export const getHexString = (data: FormData, key: string) =>
  verifyHexAddress(getString(data, key))

export const getOptionalHexString = (data: FormData, key: string) => {
  const value = getOptionalString(data, key)

  if (value == null) {
    return null
  }

  return verifyHexAddress(value)
}
