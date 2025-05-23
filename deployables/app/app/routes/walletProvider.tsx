import { WalletProvider } from '@/components'
import { Outlet } from 'react-router'

const WalletLayout = () => (
  <WalletProvider>
    <Outlet />
  </WalletProvider>
)

export default WalletLayout
