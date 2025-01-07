import { useBridgeError } from '@/inject-bridge'
import { Outlet } from 'react-router'

export const Routes = () => {
  useBridgeError('To use Zodiac Pilot with a dApp you need to launch a route.')

  return <Outlet />
}
