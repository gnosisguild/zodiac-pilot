import { useMemo, type ReactNode } from 'react'
import { Popover } from '../overlays'

type NumberValueProps = {
  children: number
  precision?: number
  additionalInfo?: ReactNode
}

export const NumberValue = ({
  children,
  precision = 2,
  additionalInfo,
}: NumberValueProps) => {
  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }),
    [precision],
  )

  const defaultNumberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 40,
      }),
    [],
  )

  return (
    <Popover
      inline
      popover={
        <div className="flex flex-col gap-1">
          <span className="tabular-numbs text-sm slashed-zero">
            {defaultNumberFormatter.format(children)}
          </span>
          {additionalInfo}
        </div>
      }
    >
      <span className="slashed-zero tabular-nums">
        {numberFormatter.format(children)}
      </span>
    </Popover>
  )
}
