import { Box } from '@/components'
import { PropsWithChildren } from 'react'

export const BaseTransaction = ({
  children,
  value,
}: PropsWithChildren<{ value: string }>) => (
  <label className="block">
    <span className="text-xs">{children}</span>

    <Box bg p={1}>
      <input
        readOnly
        type="text"
        value={value}
        className="break-words font-mono text-xs"
      />
    </Box>
  </label>
)
