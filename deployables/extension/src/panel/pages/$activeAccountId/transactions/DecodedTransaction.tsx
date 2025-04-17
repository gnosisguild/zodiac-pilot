import { TextInput } from '@zodiac/ui'
import { FunctionFragment, Result } from 'ethers'
import type { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  functionFragment: FunctionFragment
  data: Result
}>

export const DecodedTransaction = ({
  functionFragment,
  data,
  children,
}: Props) => {
  if (functionFragment.inputs.length === 0) {
    return null
  }

  return (
    <>
      {children}

      {functionFragment.inputs.map((input, i) => (
        <TextInput
          readOnly
          key={`${input.name}-${i}`}
          defaultValue={data[i].toString()}
          label={input.name}
          description={input.type}
        />
      ))}
    </>
  )
}
