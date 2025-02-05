import { Page } from '@/components'
import { verifyHexAddress, verifyPrefixedAddress } from '@zodiac/schema'
import { queryRoutes } from 'ser-kit'
import type { Route } from './+types/select-route'

export const loader = async ({
  params: { fromAddress, toAddress },
}: Route.LoaderArgs) => {
  const routes = await queryRoutes(
    verifyHexAddress(fromAddress),
    verifyPrefixedAddress(toAddress),
  )

  console.log({ routes })

  return { routes }
}

const SelectRoute = ({ loaderData: { routes } }: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Select route</Page.Header>

      <Page.Main></Page.Main>
    </Page>
  )
}

export default SelectRoute
