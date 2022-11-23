import { Web3Provider } from '@ethersproject/providers'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { useEffect, useState } from 'react'

import { wrapRequest } from '../providers/WrappingProvider'
import { Connection, Eip1193Provider } from '../types'
import { decodeRolesError } from '../utils'
import { isSmartContractAddress, validateAddress } from '../utils'

import { useConnection } from './connectionHooks'

const useConnectionDryRun = (connection: Connection) => {
  const [error, setError] = useState<string | null>(null)
  const { provider, connected } = useConnection(connection.id)

  useEffect(() => {
    const { pilotAddress, avatarAddress, moduleAddress, moduleType, roleId } =
      connection

    const configurationComplete =
      moduleType === KnownContracts.DELAY || !!roleId

    if (
      connected &&
      pilotAddress &&
      avatarAddress &&
      moduleAddress &&
      configurationComplete
    ) {
      dryRun(provider, connection)
        .then(() => {
          console.log('dry run success')
          setError(null)
        })
        .catch((e) => {
          // For the Roles mod, we actually expect the dry run to fail with TargetAddressNotAllowed()
          // In case we see any other error, we try to help the user identify the problem.

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

          console.warn('Unexpected dry run error', e)
          setError(reason || 'Unexpected error')
        })
    }
  }, [connection, provider, connected])

  return error
}

async function dryRun(provider: Eip1193Provider, connection: Connection) {
  if (!validateAddress(connection.pilotAddress)) {
    return Promise.reject('Pilot Account: Invalid address')
  }
  if (!validateAddress(connection.moduleAddress)) {
    return Promise.reject('Module Address: Invalid address')
  }
  if (!validateAddress(connection.avatarAddress)) {
    return Promise.reject('DAO Safe: Invalid address')
  }

  const ethersProvider = new Web3Provider(provider)

  if (
    !(await isSmartContractAddress(connection.moduleAddress, ethersProvider))
  ) {
    return Promise.reject('Module Address: Not a smart contract')
  }
  if (
    !(await isSmartContractAddress(connection.avatarAddress, ethersProvider))
  ) {
    return Promise.reject('DAO Safe: Not a smart contract')
  }

  const request = wrapRequest(
    {
      to: '0x0000000000000000000000000000000000000000',
      data: '0x00000000',
      from: connection.avatarAddress,
    },
    connection
  )

  await provider.request({
    method: 'eth_estimateGas',
    params: [request],
  })
}

export default useConnectionDryRun
