import { WalletProvider } from '@/components'
import { Outlet } from 'react-router'

const CreateLayout = () => (
  <WalletProvider>
    <Outlet />
  </WalletProvider>
)

export default CreateLayout
