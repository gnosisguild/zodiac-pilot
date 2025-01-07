import { useBridgeError } from '@/inject-bridge'
import { Outlet } from 'react-router'

export const Routes = () => {
  useBridgeError(
    'In order to connect Zodiac Pilot to a dApp you need to launch a route.',
  )

  return <Outlet />
}
