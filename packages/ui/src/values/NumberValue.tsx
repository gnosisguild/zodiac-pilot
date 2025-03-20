import classNames from 'classnames'
import { useMemo, type ReactNode } from 'react'
import { Popover } from '../overlays'

type NumberValueProps = {
  children: number
  precision?: number
  className?: string
  additionalInfo?: ReactNode
}

export const NumberValue = ({
  children,
  precision = 2,
  className,
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
      <span className={classNames('slashed-zero tabular-nums', className)}>
        {numberFormatter.format(children)}
      </span>
    </Popover>
  )
}
