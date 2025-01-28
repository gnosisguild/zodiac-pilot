import { useMemo } from 'react'

type SkeletonTextProps = {
  minWidth?: number
  maxWidth?: number
}

export const SkeletonText = ({
  minWidth = 20,
  maxWidth = 75,
}: SkeletonTextProps) => {
  const width = useMemo(
    () => Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth,
    [maxWidth, minWidth],
  )

  return (
    <div
      className="inline-flex h-3 animate-pulse items-center"
      style={{ width: `${width}%` }}
    >
      <div className="h-2 w-full rounded-full bg-zinc-700" />
    </div>
  )
}
