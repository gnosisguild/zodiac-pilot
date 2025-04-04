import { Popover } from '../overlays'
import { Delta } from './Delta'

const usdFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
})

export const UsdValue = ({
  children,
  delta,
}: {
  children: number
  delta?: number
}) => {
  const isPositive = delta && delta > 0

  return (
    <Popover
      inline
      popover={
        delta && (
          <Delta value={delta} invertedBackground>
            <span className="tabular-numbs text-sm slashed-zero">
              {isPositive ? '+' : '-'} {usdFormatter.format(Math.abs(delta))}
            </span>
          </Delta>
        )
      }
    >
      <Delta value={delta}>
        <span className="text-sm slashed-zero tabular-nums">
          {usdFormatter.format(children)}
        </span>
      </Delta>
    </Popover>
  )
}
