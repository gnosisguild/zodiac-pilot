import { addressSchema } from '@zodiac/schema'
import { getString } from './getString'

export const getHexString = (data: FormData, key: string) =>
  addressSchema.parse(getString(data, key))
