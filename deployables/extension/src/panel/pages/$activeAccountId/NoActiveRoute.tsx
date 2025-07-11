import { ProvideForkProvider } from '@/transactions'
import { Outlet } from 'react-router'

const NoActiveRoute = () => {
  return (
    <ProvideForkProvider route={null}>
      <Outlet />
    </ProvideForkProvider>
  )
}

export default NoActiveRoute
