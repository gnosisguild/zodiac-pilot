import { getAddress } from '@ethersproject/address'
import Safe, { EthersAdapter } from '@gnosis.pm/safe-core-sdk'
import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

import { useWalletConnectClient } from '../WalletConnectProvider'

export const useSafeModuleInfo = (
  safeAddress: string
): { loading: boolean; isValidSafe: boolean; enabledModules: string[] } => {
  const [loading, setLoading] = useState(true)
  const [isValidSafe, setIsValidSafe] = useState(false)
  const [enabledModules, setEnabledModules] = useState<string[]>([])

  const wc = useWalletConnectClient()

  useEffect(() => {
    setLoading(true)
    fetchSafeModules(wc, safeAddress)
      .then(({ isValidSafe, enabledModules }) => {
        setIsValidSafe(isValidSafe)
        setEnabledModules(enabledModules)
      })
      .finally(() => setLoading(false))
  }, [wc, safeAddress])

  return { loading, isValidSafe, enabledModules }
}

async function fetchSafeModules(
  wc: WalletConnectEthereumProvider,
  safeAddress: string
) {
  if (!isValidAddress(safeAddress)) {
    return { isValidSafe: false, enabledModules: [] }
  }

  const provider = new ethers.providers.Web3Provider(wc)
  const adapter = new EthersAdapter({
    ethers,
    signer: provider.getSigner(0),
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
    return { isValidSafe: false, enabledModules: [] }
  }
}

function isValidAddress(safeAddress: string): boolean {
  try {
    const address = getAddress(safeAddress)
    return !!address
  } catch (e) {
    return false
  }
}
