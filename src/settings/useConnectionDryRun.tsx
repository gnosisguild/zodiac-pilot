import { Web3Provider } from '@ethersproject/providers'
import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { useEffect, useState } from 'react'

import { wrapRequest } from '../providers/WrappingProvider'
import { decodeRolesError } from '../utils'

import {
  isSmartContractAddress,
  isValidAddress,
} from './Connection/addressValidation'
import { useConnection } from './connectionHooks'

const useConnectionDryRun = ({
  moduleAddress,
  avatarAddress,
  roleId,
}: {
  moduleAddress: string
  avatarAddress: string
  roleId: string
}) => {
  const [error, setError] = useState<string | null>(null)
  const { provider, connected } = useConnection()

  useEffect(() => {
    if (connected && avatarAddress && moduleAddress && roleId) {
      dryRun(provider, moduleAddress, avatarAddress, roleId)
        .then(() => {
          console.log('no error')
          setError(null)
        })
        .catch((e) => {
          console.warn(e)
          const reason = typeof e === 'string' ? decodeRolesError(e) : null

          if (reason === 'execution reverted: Module not authorized') {
            setError(
              "The Pilot Account's address must be enabled as a module of the modifier."
            )
            return
          }

          if (reason === 'UnacceptableMultiSendOffset()') {
            // we're calling to the zero address, so if this error happens it means our call was handled as a multi-send which happens
            // if the Role mod's multiSend address has not been initialized
            setError(
              "The Roles mod is not configured to accept multi-send calls. Use the contract's `setMultiSend` function to set the multi-send address."
            )
            return
          }

          if (reason === 'TargetAddressNotAllowed()') {
            // this is the expected error for a working Roles mod setup
            setError(null)
            return
          }

          if (reason === 'NoMembership()') {
            setError(
              `The Pilot account is not a member of role #${roleId || 0}.`
            )
            return
          }

          setError(reason || 'Unexpected error')
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

  const ethersProvider = new Web3Provider(provider)

  if (!(await isSmartContractAddress(moduleAddress, ethersProvider))) {
    return Promise.reject('Module Address: Not a smart contract')
  }
  if (!(await isSmartContractAddress(avatarAddress, ethersProvider))) {
    return Promise.reject('DAO Safe: Not a smart contract')
  }

  const request = wrapRequest(
    {
      to: '0x0000000000000000000000000000000000000000',
      data: '0x00',
      from: avatarAddress,
    },
    pilotAddress,
    moduleAddress,
    roleId
  )

  await provider.request({
    method: 'eth_estimateGas',
    params: [request],
  })
}

export default useConnectionDryRun
