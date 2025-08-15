import { authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { dbClient, getWalletLabels } from '@zodiac/db'
import { ConnectWalletButton } from '@zodiac/web3'
import { Outlet } from 'react-router'
import { Route } from './+types/layout'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { user },
      },
    }) => ({
      addressLabels:
        user == null ? {} : await getWalletLabels(dbClient(), user.id),
    }),
  )

const SendLayout = ({
  loaderData: { addressLabels },
}: Route.ComponentProps) => (
  <Page>
    <Page.Header action={<ConnectWalletButton addressLabels={addressLabels} />}>
      Send tokens
    </Page.Header>

    <Page.Main>
      <Outlet />
    </Page.Main>
  </Page>
)

export default SendLayout
