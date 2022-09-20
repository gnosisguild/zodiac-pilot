import { Web3Provider } from '@ethersproject/providers'
import { useEffect, useState } from 'react'

import { wrapRequest } from '../providers/WrappingProvider'
import { Connection, Eip1193Provider } from '../types'
import { decodeRolesError } from '../utils'

import {
  isSmartContractAddress,
  isValidAddress,
} from './Connection/addressValidation'
import { useConnection } from './connectionHooks'

const useConnectionDryRun = ({
  id,
  pilotAddress,
  moduleAddress,
  avatarAddress,
  roleId,
}: Connection) => {
  const [error, setError] = useState<string | null>(null)
  const { provider, connected } = useConnection(id)

  useEffect(() => {
    if (connected && pilotAddress && avatarAddress && moduleAddress && roleId) {
      dryRun(provider, pilotAddress, moduleAddress, avatarAddress, roleId)
        .then(() => {
          console.log('dry run success')
          setError(null)
        })
        .catch((e) => {
          console.warn(e)
          const message: string | undefined =
            typeof e === 'string' ? e : e.data?.message
          const reason = message && decodeRolesError(message)

          if (reason === 'Module not authorized') {
            setError(
              'The Pilot Account address must be enabled as a module of the modifier.'
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
  }, [pilotAddress, moduleAddress, avatarAddress, roleId, provider, connected])

  return error
}

async function dryRun(
  provider: Eip1193Provider,
  pilotAddress: string,
  moduleAddress: string,
  avatarAddress: string,
  roleId: string
) {
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
      data: '0x00000000',
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
