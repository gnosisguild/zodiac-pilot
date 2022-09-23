import { Web3Provider } from '@ethersproject/providers'
import Safe, { EthersAdapter } from '@gnosis.pm/safe-core-sdk'
import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

import { Eip1193Provider } from '../../types'
import { useConnection } from '../connectionHooks'

import { isValidAddress } from './addressValidation'

export const useSafeModuleInfo = (
  safeAddress: string,
  connectionId?: string
): { loading: boolean; isValidSafe: boolean; enabledModules: string[] } => {
  const [loading, setLoading] = useState(true)
  const [isValidSafe, setIsValidSafe] = useState(false)
  const [enabledModules, setEnabledModules] = useState<string[]>([])

  const { provider, connected } = useConnection(connectionId)
  useEffect(() => {
    if (!connected) return

    setLoading(true)
    fetchSafeModules(provider, safeAddress)
      .then(({ isValidSafe, enabledModules }) => {
        setIsValidSafe(isValidSafe)
        setEnabledModules(enabledModules)
      })
      .finally(() => setLoading(false))
  }, [provider, safeAddress, connected])

  return { loading, isValidSafe, enabledModules }
}

async function fetchSafeModules(
  provider: Eip1193Provider,
  safeAddress: string
) {
  if (!isValidAddress(safeAddress)) {
    return { isValidSafe: false, enabledModules: [] }
  }

  const adapter = new EthersAdapter({
    ethers,
    signer: new Web3Provider(provider).getSigner(0),
  })

  try {
    const safeSdk: Safe = await Safe.create({
      ethAdapter: adapter,
      safeAddress,
    })
    const modules = await safeSdk.getModules()

    const result = await Promise.all(
      modules.map((moduleAddress) =>
        safeSdk.isModuleEnabled(moduleAddress).then((isEnabled) => ({
          moduleAddress,
          isEnabled,
        }))
      )
    )

    const enabledModules = result
      .filter(({ isEnabled }) => isEnabled)
      .map(({ moduleAddress }) => moduleAddress)

    return { isValidSafe: true, enabledModules }
  } catch (e) {
    console.error('Could not fetch Safe modules', e)
    return { isValidSafe: false, enabledModules: [] }
  }
}
