const usdFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
})

export const UsdValue = ({ children }: { children: number }) => (
  <span className="text-sm slashed-zero tabular-nums">
    {usdFormatter.format(children)}
  </span>
)
