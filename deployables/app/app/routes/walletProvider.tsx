import { WalletProvider } from '@zodiac/web3'
import { Outlet } from 'react-router'

const WalletLayout = () => (
  <WalletProvider>
    <Outlet />
  </WalletProvider>
)

export default WalletLayout
