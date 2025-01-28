import { Page } from '@/components'
import { Outlet } from 'react-router'

const BalancesLayout = () => (
  <Page fullWidth>
    <Page.Header>Balances</Page.Header>

    <Page.Main>
      <Outlet />
    </Page.Main>
  </Page>
)

export default BalancesLayout
