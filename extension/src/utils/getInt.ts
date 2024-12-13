import { getString } from './getString'

export const getInt = (data: FormData, key: string): number => {
  const stringValue = getString(data, key)

  return parseInt(stringValue)
}
