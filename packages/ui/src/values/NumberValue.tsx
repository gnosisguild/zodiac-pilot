import { useMemo } from 'react'
import { Popover } from '../overlays'

type NumberValueProps = {
  children: number
  precision?: number
}

const defaultNumberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 40,
})

export const NumberValue = ({ children, precision = 2 }: NumberValueProps) => {
  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }),
    [precision],
  )

  return (
    <Popover
      inline
      popover={
        <span className="tabular-numbs text-sm slashed-zero">
          {defaultNumberFormatter.format(children)}
        </span>
      }
    >
      <span className="slashed-zero tabular-nums">
        {numberFormatter.format(children)}
      </span>
    </Popover>
  )
}
