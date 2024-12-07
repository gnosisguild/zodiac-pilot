import { TextInput } from '@/components'
import { FunctionFragment, Result } from 'ethers'

interface Props {
  functionFragment: FunctionFragment
  data: Result
}
export const DecodedTransaction = ({ functionFragment, data }: Props) => {
  if (functionFragment.inputs.length === 0) {
    return null
  }

  return functionFragment.inputs.map((input, i) => (
    <TextInput
      readOnly
      key={`${input.name}-${i}`}
      defaultValue={data[i].toString()}
      label={input.name}
      description={input.type}
    />
  ))
}
