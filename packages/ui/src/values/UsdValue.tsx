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
      <span className={'text-sm slashed-zero tabular-nums'}>
        {usdFormatter.format(children)}
      </span>
    </Popover>
  )
}
