import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { Interface } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'

import permissionsAbi from '../abi/Permissions.json'
import rolesAbi from '../abi/Roles.json'
import { useWalletConnectProvider } from '../providers'
import { wrapRequest } from '../providers/WrappingProvider'

import isValidAddress from './isValidAddress'

const permissionsInterface = new Interface(permissionsAbi)
const rolesInterface = new Interface(rolesAbi)

const useAddressDryRun = ({
  moduleAddress,
  avatarAddress,
  roleId,
}: {
  moduleAddress: string
  avatarAddress: string
  roleId: string
}) => {
  const [error, setError] = useState<string | null>(null)
  const { provider, connected } = useWalletConnectProvider()
  console.log({ error })
  useEffect(() => {
    if (connected && avatarAddress && moduleAddress) {
      dryRun(provider, moduleAddress, avatarAddress, roleId)
        .then(() => {
          setError(null)
        })
        .catch((e) => {
          console.log('catch', e)
          console.warn(e)
          if (e === 'execution reverted: Module not authorized') {
            setError(
              "The Pilot Account's address must be enabled as a module of the modifier."
            )
            return
          }

          const knownError =
            e.data &&
            (Object.keys(rolesInterface.errors).find(
              (errSig) => rolesInterface.getSighash(errSig) === e.data
            ) ||
              Object.keys(permissionsInterface.errors).find(
                (errSig) => permissionsInterface.getSighash(errSig) === e.data
              ))

          if (knownError === 'TargetAddressNotAllowed()') {
            // this is the expected error for a working Roles mod setup
            setError(null)
            return
          }

          if (knownError === 'NoMembership()') {
            setError(
              `The Pilot account is not a member of role #${roleId || 0}`
            )
            return
          }

          if (knownError) {
            setError(knownError)
            return
          }

          setError(typeof e === 'string' ? e : e.message)
        })
    }
  }, [moduleAddress, avatarAddress, roleId, provider, connected])

  return error
}

async function dryRun(
  provider: WalletConnectEthereumProvider,
  moduleAddress: string,
  avatarAddress: string,
  roleId: string
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
      data: '0xffffffff',
      from: avatarAddress,
    },
    pilotAddress,
    moduleAddress,
    roleId
  )

  return provider.request({
    method: 'eth_call',
    params: [request, 'latest'],
  })
}

export default useAddressDryRun
