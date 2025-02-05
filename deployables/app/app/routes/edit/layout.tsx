import { Page } from '@/components'
import { Outlet } from 'react-router'

const EditLayout = () => (
  <Page>
    <Page.Header>Edit route</Page.Header>

    <Page.Main>
      <Outlet />
    </Page.Main>
  </Page>
)

export default EditLayout
