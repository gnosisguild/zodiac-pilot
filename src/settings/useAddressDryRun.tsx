import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { useEffect, useState } from 'react'

import { useWalletConnectProvider } from '../providers'
import { wrapRequest } from '../providers/WrappingProvider'

import isValidAddress from './isValidAddress'

const useAddressDryRun = ({
  moduleAddress,
  avatarAddress,
}: {
  moduleAddress: string
  avatarAddress: string
}) => {
  const [error, setError] = useState(null)
  const { provider, connected } = useWalletConnectProvider()

  useEffect(() => {
    if (connected && avatarAddress) {
      dryRun(provider, moduleAddress, avatarAddress)
        .then(() => {
          setError(null)
        })
        .catch((e) => {
          setError(e)
        })
    }
  }, [moduleAddress, avatarAddress, provider, connected])

  return error
}

function dryRun(
  provider: WalletConnectEthereumProvider,
  moduleAddress: string,
  avatarAddress: string
) {
  const pilotAddress = provider.accounts[0]

  if (!isValidAddress(pilotAddress)) {
    return Promise.reject('Pilot Account: Invalid address')
  }

  if (!isValidAddress(moduleAddress)) {
    return Promise.reject('Module Address: Invalid address')
  }

  if (!isValidAddress(avatarAddress)) {
    return Promise.reject('DAO Safe: Invalid address')
  }

  const request = wrapRequest(
    {
      to: '0x0000000000000000000000000000000000000000',
      data: '0x00',
      from: avatarAddress,
    },
    pilotAddress,
    moduleAddress
  )

  return provider.request({
    method: 'eth_call',
    params: [request, 'latest'],
  })
}

export default useAddressDryRun
