import { findActiveAccount } from '@/accounts'
import { getFeatures, getUser, ProvideCompanionAppContext } from '@/companion'
import { getCompanionAppUrl } from '@zodiac/env'
import { FeatureProvider } from '@zodiac/ui'
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useRevalidator,
  type LoaderFunctionArgs,
} from 'react-router'
import { useDeleteRoute } from './useDeleteRoute'
import { useRevalidateOnSignIn } from './useRevalidateOnSignIn'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const [activeAccount, features, user] = await Promise.all([
    findActiveAccount({ signal: request.signal }),
    getFeatures({ signal: request.signal }),
    getUser({ signal: request.signal }),
  ])

  return {
    activeAccountId: activeAccount == null ? null : activeAccount.id,
    companionAppUrl: getCompanionAppUrl(),
    features,
    user,
  }
}

const Root = () => {
  const { activeAccountId, companionAppUrl, features, user } =
    useLoaderData<typeof loader>()

  const { revalidate } = useRevalidator()
  const navigate = useNavigate()

  useDeleteRoute({
    onDelete: (deletedAccountId) => {
      if (deletedAccountId === activeAccountId) {
        navigate(`/${activeAccountId}/clear-transactions/${activeAccountId}`)
      } else {
        revalidate()
      }
    },
  })

  useRevalidateOnSignIn(user != null)

  return (
    <FeatureProvider features={features}>
      <ProvideCompanionAppContext url={companionAppUrl} user={user}>
        <Outlet />
      </ProvideCompanionAppContext>
    </FeatureProvider>
  )
}

export default Root
