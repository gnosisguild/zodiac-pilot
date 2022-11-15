import { Web3Provider } from '@ethersproject/providers'
import {
  CONTRACT_ABIS,
  CONTRACT_ADDRESSES,
  KnownContracts,
} from '@gnosis.pm/zodiac'
import { selectorsFromBytecode } from '@shazow/whatsabi'
import { Contract, providers, utils } from 'ethers'
import detectProxyTarget from 'ethers-proxies'
import { FormatTypes, Interface } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'

import { useConnection } from '../connectionHooks'

import { isValidAddress } from './addressValidation'

const SUPPORTED_MODULES = [KnownContracts.DELAY, KnownContracts.ROLES]
export type SupportedModuleType = KnownContracts.DELAY | KnownContracts.ROLES

interface Module {
  moduleAddress: string
  mastercopyAddress?: string // if empty, it's a custom non-proxied deployment
  type: SupportedModuleType
  modules?: Module[]
}

export const useZodiacModules = (
  safeAddress: string,
  connectionId?: string
): { loading: boolean; isValidSafe: boolean; modules: Module[] } => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [modules, setModules] = useState<Module[]>([])

  const { provider, connected, chainId } = useConnection(connectionId)
  useEffect(() => {
    if (!connected) return

    setLoading(true)
    setError(false)
    fetchModules(safeAddress, new Web3Provider(provider, chainId || undefined))
      .then((modules) => setModules(modules))
      .catch((e) => {
        console.error(`Could not fetch modules of Safe ${safeAddress}`, e)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [provider, safeAddress, connected, chainId])

  if (!isValidAddress(safeAddress) || error) {
    return { isValidSafe: false, loading, modules: [] }
  }

  return { loading, isValidSafe: true, modules }
}

async function fetchModules(
  safeOrModifierAddress: string,
  provider: providers.BaseProvider
): Promise<Module[]> {
  const mastercopyAddresses = CONTRACT_ADDRESSES[provider.network.chainId]
  const contract = new Contract(safeOrModifierAddress, IAvatarAbi, provider)

  const moduleAddresses = (
    await contract.getModulesPaginated(ADDRESS_ONE, 100)
  )[0] as string[]

  const enabledAndSupportedModules = moduleAddresses.map(
    async (moduleAddress) => {
      const isEnabled = await contract.isModuleEnabled(moduleAddress)
      if (!isEnabled) return

      const mastercopyAddress = await detectProxyTarget(moduleAddress, provider)

      let [type] = (Object.entries(mastercopyAddresses).find(
        ([address]) => address === mastercopyAddress
      ) || []) as [KnownContracts | undefined, string]

      const implementationAddress = mastercopyAddress || moduleAddress
      if (!type) {
        // Not a proxy to one of our master copies. It might be a custom deployment.
        // We try to detect selectors from byte code and match them against the ABIs of known Zodiac modules.
        const code = await provider.getCode(implementationAddress)
        const selectors = selectorsFromBytecode(code)

        const match = Object.entries(CONTRACT_ABIS).find(([, abi]) =>
          functionSelectors(abi).every((sighash) => selectors.includes(sighash))
        ) as [KnownContracts | undefined, string[]]

        if (match) {
          type = match[0]
        }
      }

      if (!type || !SUPPORTED_MODULES.includes(type)) {
        return undefined
      }

      let modules: Module[] | null = null
      if (MODIFIERS.includes(type)) {
        // recursively fetch modules from modifier
        try {
          modules = await fetchModules(moduleAddress, provider)
        } catch (e) {
          console.error(
            `Could not fetch sub modules of ${type} modifier ${moduleAddress}`,
            e
          )
          modules = []
        }
      }

      return {
        moduleAddress,
        mastercopyAddress,
        type,
        modules,
      }
    }
  )

  const result = await Promise.all(enabledAndSupportedModules)
  return result.filter((module) => !!module) as Module[]
}

const functionSelectors = (abi: string[]) => {
  const iface = new Interface(abi)
  return Object.values(iface.functions).map((f) =>
    utils.id(f.format(FormatTypes.sighash)).substring(0, 10)
  )
}

const MODIFIERS = [KnownContracts.ROLES, KnownContracts.DELAY]

const IAvatarAbi = new Interface([
  'function isModuleEnabled(address module) view returns (bool)',
  'function getModulesPaginated(address start, uint256 pageSize) view returns (address[] memory array, address next)',
])

const ADDRESS_ONE = '0x0000000000000000000000000000000000000001'

export const MODULE_NAMES = {
  [KnownContracts.DELAY]: 'Delay',
  [KnownContracts.ROLES]: 'Roles',
}
