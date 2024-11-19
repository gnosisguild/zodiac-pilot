import { Blockie, Box, ConnectionStack } from '@/components'
import { useZodiacRoute } from '@/zodiac-routes'
import { Link } from 'react-router-dom'
import { asLegacyConnection } from '../../legacyConnectionMigrations'
import { ConnectionsIcon } from './ConnectionsIcon'

export const RouteBubble = () => {
  const route = useZodiacRoute()
  const connection = asLegacyConnection(route)

  return (
    <Box
      rounded
      className="group hover:border-zodiac-light-mustard hover:border-opacity-80"
    >
      <div className="flex gap-1">
        <Box bg roundedLeft className="flex-1 py-0 pl-0 pr-2">
          <Link to={'/routes/' + route.id}>
            <div className="flex items-center gap-2">
              <div className="flex h-10 flex-shrink-0 p-1">
                {connection.pilotAddress && (
                  <div className="rounded-full border-2 border-slate-900">
                    <Blockie
                      address={connection.pilotAddress}
                      className="h-full"
                    />
                  </div>
                )}
                {connection.moduleAddress && (
                  <div className="-ml-4 rounded-full border-2 border-slate-900">
                    <Blockie
                      address={connection.moduleAddress}
                      className="h-full"
                    />
                  </div>
                )}
                <div className="-ml-4 rounded-full border-2 border-slate-900">
                  <Blockie
                    address={connection.avatarAddress}
                    className="h-full"
                  />
                </div>
              </div>
              <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                {connection.label}
              </p>
            </div>
          </Link>
        </Box>
        <Link to="/routes">
          <Box
            bg
            roundedRight
            className="h-11 w-14 overflow-hidden group-hover:border-zodiac-light-mustard group-hover:border-opacity-80"
          >
            <span className="sr-only">Configure routes</span>
            <ConnectionsIcon height="100%" width="100%" />
          </Box>
        </Link>
      </div>

      <div className="pointer-events-none absolute -bottom-24 -right-px isolate z-10 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        <Box className="rounded-md bg-slate-900 bg-opacity-20 p-4 backdrop-blur-sm">
          <Link to={`/routes/${connection.id}`}>
            <ConnectionStack connection={connection} />
          </Link>
        </Box>
      </div>
    </Box>
  )
}
