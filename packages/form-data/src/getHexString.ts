import { verifyHexAddress } from '@zodiac/schema'
import { getString } from './getString'

export const getHexString = (data: FormData, key: string) =>
  verifyHexAddress(getString(data, key))
