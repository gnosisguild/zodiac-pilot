import { Box } from '@/components'
import { FunctionFragment, Result } from 'ethers'
import classes from './style.module.css'

interface Props {
  functionFragment: FunctionFragment
  data: Result
}
export const DecodedTransaction = ({ functionFragment, data }: Props) => (
  <div className={classes.transaction}>
    {functionFragment.inputs.length > 0 && (
      <fieldset>
        {functionFragment.inputs.map((input, i) => (
          <label key={input.name}>
            <span>
              {input.name} <i className={classes.inputType}>{input.type}</i>
            </span>
            <Box p={1} bg>
              <input type="text" value={data[i].toString()} readOnly />
            </Box>
          </label>
        ))}
      </fieldset>
    )}
  </div>
)
