import { Box } from '@/components'
import classes from './style.module.css'

interface Props {
  data: string
}

export const RawTransaction = ({ data }: Props) => (
  <div className={classes.transaction}>
    <label>
      <span>Data</span>
      <Box p={1} bg>
        <input
          className={classes.rawTxData}
          type="text"
          value={data || ''}
          readOnly
        />
      </Box>
    </label>
  </div>
)
