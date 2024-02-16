import { JsonRpcBatchProvider } from '@ethersproject/providers'
import {
  ContractAbis,
  ContractAddresses,
  KnownContracts,
  SupportedNetworks,
} from '@gnosis.pm/zodiac'
import { selectorsFromBytecode } from '@shazow/whatsabi'
import { Contract, providers, utils } from 'ethers'
import { FormatTypes, Interface } from 'ethers/lib/utils'
import detectProxyTarget from 'ethers-proxies'
import { useEffect, useState } from 'react'

import { validateAddress } from '../utils'
import { useConnection } from './connectionHooks'
import { ChainId, RPC } from '../chains'
import { getReadOnlyProvider } from '../providers/readOnlyProvider'

const SUPPORTED_MODULES = [
  KnownContracts.DELAY,
  KnownContracts.ROLES_V1,
  KnownContracts.ROLES_V2,
]
export type SupportedModuleType =
  | KnownContracts.DELAY
  | KnownContracts.ROLES_V1
  | KnownContracts.ROLES_V2

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

  const { chainId } = useConnection(connectionId)

  useEffect(() => {
    if (!chainId) return
    const provider = getReadOnlyProvider(chainId as ChainId)

    setLoading(true)
    setError(false)
    fetchModules(safeAddress, provider)
      .then((modules) => setModules(modules))
      .catch((e) => {
        console.error(`Could not fetch modules of Safe ${safeAddress}`, e)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [chainId, safeAddress])

  if (!validateAddress(safeAddress) || error) {
    return { isValidSafe: false, loading, modules: [] }
  }

  return { loading, isValidSafe: true, modules }
}

async function fetchModules(
  safeOrModifierAddress: string,
  provider: providers.BaseProvider
): Promise<Module[]> {
  const mastercopyAddresses =
    ContractAddresses[provider.network.chainId as SupportedNetworks] || {}
  const contract = new Contract(
    safeOrModifierAddress,
    AvatarInterface,
    provider
  )

  const moduleAddresses = (
    await contract.getModulesPaginated(ADDRESS_ONE, 100)
  )[0] as string[]

  const enabledAndSupportedModules = moduleAddresses.map(
    async (moduleAddress) => {
      const isEnabled = await contract.isModuleEnabled(moduleAddress)
      if (!isEnabled) return

      const mastercopyAddress = await detectProxyTarget(moduleAddress, provider)

      let [type] = (Object.entries(mastercopyAddresses).find(
        ([, address]) => address === mastercopyAddress
      ) || []) as [KnownContracts | undefined, string]

      const implementationAddress = mastercopyAddress || moduleAddress

      // 'roles' is the old name for roles_v1 is still configured as an alias in the zodiac package for backwards compatibility
      if (type === KnownContracts.ROLES) type = KnownContracts.ROLES_V1

      if (!type) {
        // Not a proxy to one of our master copies. It might be a custom deployment.
        // We try to detect selectors from byte code and match them against the ABIs of known Zodiac modules.
        const code = await provider.getCode(implementationAddress)
        const selectors = selectorsFromBytecode(code)

        const match = Object.entries(ContractAbis).find(([, abi]) =>
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
        moduleAddress: moduleAddress.toLowerCase(),
        mastercopyAddress: mastercopyAddress?.toLowerCase(),
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

const MODIFIERS = [
  KnownContracts.ROLES_V1,
  KnownContracts.ROLES_V2,
  KnownContracts.DELAY,
]

export const AvatarInterface = new Interface([
  'function execTransactionFromModule(address to, uint256 value, bytes memory data, uint8 operation) returns (bool success)',
  'function isModuleEnabled(address module) view returns (bool)',
  'function getModulesPaginated(address start, uint256 pageSize) view returns (address[] memory array, address next)',
])

const ADDRESS_ONE = '0x0000000000000000000000000000000000000001'

export const MODULE_NAMES = {
  [KnownContracts.DELAY]: 'Delay',
  [KnownContracts.ROLES_V1]: 'Roles v1',
  [KnownContracts.ROLES_V2]: 'Roles v2',
}
