import { Blockie, ConnectionStack } from '@/components'
import { useZodiacRoute } from '@/zodiac-routes'
import { Transition } from '@headlessui/react'
import { Cog } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Stick from 'react-stick'
import { asLegacyConnection } from '../../legacyConnectionMigrations'

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
          <div className="isolate z-10 pt-2">
            <div className="rounded-md border border-zinc-500/80 bg-zinc-900/80 px-4 py-2 shadow-lg backdrop-blur-sm">
              <ConnectionStack connection={connection} />
            </div>
          </div>
        </Transition>
      }
    >
      <div
        className="group flex gap-2 overflow-hidden rounded-full border border-zinc-600/80 bg-zinc-800 hover:border-zinc-500/80"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Link to={'/routes/' + route.id} className="flex-1">
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

        <Link
          to="/routes"
          className="flex flex-shrink-0 items-center justify-center rounded-full px-3 py-2 text-zinc-200 hover:bg-zinc-500/80"
        >
          <span className="sr-only">Configure routes</span>
          <Cog size={20} />
        </Link>
      </div>
    </Stick>
  )
}
