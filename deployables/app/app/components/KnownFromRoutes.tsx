import type { ExecutionRoute, PrefixedAddress } from '@zodiac/schema'
import { Popover } from '@zodiac/ui'

type KnownFromRoutesProps = {
  routes: ExecutionRoute[]
  address: PrefixedAddress
}

export const KnownFromRoutes = ({ routes, address }: KnownFromRoutesProps) => {
  const labels = routes.reduce((result, route) => {
    if (route.label == null) {
      return result
    }

    if (
      route.initiator != null &&
      route.initiator.toLowerCase() === address.toLowerCase()
    ) {
      return [...result, route.label]
    }

    if (route.avatar.toLowerCase() === address.toLowerCase()) {
      return [...result, route.label]
    }

    return result
  }, [] as string[])

  if (labels.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 overflow-hidden text-xs text-zinc-600 dark:text-zinc-300">
      {labels.length === 1 ? (
        labels[0]
      ) : (
        <Popover
          popover={
            <ul className="m-1 list-inside list-disc text-xs">
              {labels.toSorted().map((label) => (
                <li key={label} className="whitespace-nowrap pr-2 last:pr-0">
                  {label}
                </li>
              ))}
            </ul>
          }
        >
          {labels.length} routes
        </Popover>
      )}
    </div>
  )
}
