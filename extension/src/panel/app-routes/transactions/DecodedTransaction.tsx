import { Box, TextInput } from '@/components'
import { FunctionFragment, Result } from 'ethers'

interface Props {
  functionFragment: FunctionFragment
  data: Result
}
export const DecodedTransaction = ({ functionFragment, data }: Props) => {
  if (functionFragment.inputs.length === 0) {
    return null
  }

  return (
    <Box p={2} bg>
      {functionFragment.inputs.length > 0 && (
        <fieldset className="flex flex-col gap-3 text-xs">
          {functionFragment.inputs.map((input, i) => (
            <TextInput
              key={`${input.name}-${i}`}
              readOnly
              defaultValue={data[i].toString()}
              label={input.name}
              description={input.type}
            />
          ))}
        </fieldset>
      )}
    </Box>
  )
}
