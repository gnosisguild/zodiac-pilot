import { BigNumber } from 'ethers'

// Tenderly has particular requirements for the encoding of value: it must not have any leading zeros
export const formatValue = (value: string): string => {
  const valueBN = BigNumber.from(value)
  if (valueBN.isZero()) return '0x0'
  else return valueBN.toHexString().replace(/^0x(0+)/, '0x')
}
