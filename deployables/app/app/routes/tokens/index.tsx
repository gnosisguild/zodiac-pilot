import { WalletProvider } from '@/components'
import { Suspense } from 'react'
import { Outlet } from 'react-router'

const Tokens = () => {
  return (
    <Suspense>
      <WalletProvider injectedOnly>
        <Outlet />
      </WalletProvider>
    </Suspense>
  )
}

export default Tokens
