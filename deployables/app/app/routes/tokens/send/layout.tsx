import { Page } from '@/components'
import { Outlet } from 'react-router'

const SendLayout = () => (
  <Page>
    <Page.Header>Send tokens</Page.Header>

    <Page.Main>
      <Outlet />
    </Page.Main>
  </Page>
)

export default SendLayout
