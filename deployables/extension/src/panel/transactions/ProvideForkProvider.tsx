import { useAccount } from '@/accounts'
import { ForkProvider } from '@/providers'
import type { ExecutionRoute } from '@/types'
import { invariant } from '@epic-web/invariant'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import { ConnectionType, unprefixAddress } from 'ser-kit'
import { getModuleAddress } from './getModuleAddress'

const ProviderContext = createContext<ForkProvider | null>(null)

export const ProvideForkProvider = ({
  children,
  route,
}: PropsWithChildren<{ route: ExecutionRoute | null }>) => {
  const { chainId, address } = useAccount()

  const moduleAddress = getModuleAddress(route)
  const ownerAddress = getOwnerAddress(route)

  const [provider, setProvider] = useState<ForkProvider | null>(null)

  // whenever anything changes in the connection settings, we delete the current fork and start afresh
  useEffect(() => {
    const provider = new ForkProvider({
      chainId,
      avatarAddress: address,
      moduleAddress,
      ownerAddress,
    })

    setProvider(provider)

    return () => {
      provider.deleteFork()
    }
  }, [chainId, address, moduleAddress, ownerAddress])

  if (provider == null) {
    return null
  }

  return <ProviderContext value={provider}>{children}</ProviderContext>
}

export const useProvider = () => {
  const provider = useContext(ProviderContext)

  invariant(
    provider != null,
    'useProvider() must be used within a <ProvideProvider/>',
  )

  return provider
}

const getOwnerAddress = (route: ExecutionRoute | null) => {
  if (route == null) {
    return
  }

  const { waypoints } = route

  if (waypoints == null) {
    return
  }

  const avatarWaypoint = waypoints[waypoints.length - 1]

  if (!('connection' in avatarWaypoint)) {
    return
  }

  if (avatarWaypoint.connection.type !== ConnectionType.OWNS) {
    return
  }

  return unprefixAddress(avatarWaypoint.connection.from)
}
