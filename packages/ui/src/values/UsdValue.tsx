import { Popover } from '../overlays'

const usdFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
})

export const UsdValue = ({
  children,
  balanceDiff,
}: {
  children: number
  balanceDiff?: number
}) => {
  const textColor =
    balanceDiff == null
      ? 'text-gray-600'
      : balanceDiff > 0
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400'

  return (
    <Popover
      inline
      popover={
        balanceDiff && (
          <span className="tabular-numbs text-sm slashed-zero">
            {usdFormatter.format(balanceDiff)}
          </span>
        )
      }
    >
      <span className={`text-sm slashed-zero tabular-nums ${textColor}`}>
        {usdFormatter.format(children)}
      </span>
    </Popover>
  )
}
