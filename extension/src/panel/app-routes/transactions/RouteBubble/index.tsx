import { Blockie, Box, ConnectionStack } from '@/components'
import { useZodiacRoute } from '@/zodiac-routes'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Stick from 'react-stick'
import { asLegacyConnection } from '../../legacyConnectionMigrations'
import { ConnectionsIcon } from './ConnectionsIcon'

export const RouteBubble = () => {
  const route = useZodiacRoute()
  const connection = asLegacyConnection(route)
  const [hover, setHover] = useState(false)

  return (
    <Stick
      sameWidth
      position="bottom center"
      node={
        <Transition
          show={hover}
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          enter="transition-opacity"
          leave="transition-opacity"
        >
          <div className={classNames('isolate z-10 pt-4')}>
            <Box className="rounded-md bg-zinc-900/80 p-2 shadow-lg backdrop-blur-sm">
              <ConnectionStack connection={connection} />
            </Box>
          </div>
        </Transition>
      }
    >
      <Box
        rounded
        className="group hover:border-zodiac-light-mustard hover:border-opacity-80"
      >
        <div
          className="flex gap-1"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
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
                    <div className="-ml-4 rounded-full border-2 border-slate-900 first:ml-0">
                      <Blockie
                        address={connection.moduleAddress}
                        className="h-full"
                      />
                    </div>
                  )}
                  <div className="-ml-4 rounded-full border-2 border-slate-900 first:ml-0">
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
      </Box>
    </Stick>
  )
}
