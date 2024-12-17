import { getChainId } from '@/chains'
import { getReadOnlyProvider } from '@/providers'
import { HexAddress } from '@/types'
import {
  ContractAbis,
  ContractAddresses,
  KnownContracts,
} from '@gnosis.pm/zodiac'
import { selectorsFromBytecode } from '@shazow/whatsabi'
import { Contract, id, Interface, ZeroAddress } from 'ethers'
import detectProxyTarget from 'evm-proxy-detection'
import { useEffect, useState } from 'react'
import { ChainId, PrefixedAddress, splitPrefixedAddress } from 'ser-kit'
import { SupportedModuleType } from './types'

const SUPPORTED_MODULES = [
  KnownContracts.DELAY,
  KnownContracts.ROLES_V1,
  KnownContracts.ROLES_V2,
]
interface Module {
  moduleAddress: string
  mastercopyAddress?: string // if empty, it's a custom non-proxied deployment
  type: SupportedModuleType
  modules?: Module[]
}

export const useZodiacModules = (
  safeAddress: PrefixedAddress
): { loading: boolean; isValidSafe: boolean; modules: Module[] } => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [modules, setModules] = useState<Module[]>([])
  const chainId = getChainId(safeAddress)
  const [, address] = splitPrefixedAddress(safeAddress)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetchModules(address, chainId)
      .then((modules) => setModules(modules))
      .catch((e) => {
        console.error(`Could not fetch modules of Safe ${address}`, e)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [address, chainId])

  if (error) {
    return { isValidSafe: false, loading, modules: [] }
  }

  return { loading, isValidSafe: true, modules }
}

async function fetchModules(
  safeOrModifierAddress: HexAddress,
  chainId: ChainId,
  previous: Set<string> = new Set()
): Promise<Module[]> {
  if (safeOrModifierAddress === ZeroAddress) {
    return []
  }

  if (previous.has(safeOrModifierAddress.toLowerCase())) {
    // circuit breaker in case of circular module references
    return []
  }
  previous.add(safeOrModifierAddress.toLowerCase())

  const provider = getReadOnlyProvider(chainId)

  const mastercopyAddresses = ContractAddresses[chainId] || {}

  const contract = new Contract(
    safeOrModifierAddress,
    AvatarInterface,
    provider
  )
  const moduleAddresses = (
    await contract.getModulesPaginated(ADDRESS_ONE, 100)
  )[0] as HexAddress[]

  const enabledAndSupportedModules = moduleAddresses.map(
    async (moduleAddress) => {
      const isEnabled = await contract.isModuleEnabled(moduleAddress)
      if (!isEnabled) return

      const result = await detectProxyTarget(
        moduleAddress as `0x${string}`,
        ({ method, params }) => provider.send(method, params)
      )
      const mastercopyAddress = result?.target.toLowerCase()

      let [type] = (Object.entries(mastercopyAddresses).find(
        ([, address]) => address === mastercopyAddress
      ) || []) as [KnownContracts | undefined, string]

      const implementationAddress = mastercopyAddress || moduleAddress

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

      // 'roles' is the old name for roles_v1 is still configured as an alias in the zodiac package for backwards compatibility
      if (type === KnownContracts.ROLES) type = KnownContracts.ROLES_V1

      if (!type || !SUPPORTED_MODULES.includes(type)) {
        return undefined
      }

      let modules: Module[] | null = null
      if (MODIFIERS.includes(type)) {
        // recursively fetch modules from modifier
        try {
          modules = await fetchModules(moduleAddress, chainId, previous)
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
  return iface.fragments
    .filter((f) => f.type === 'function')
    .map((f) => id(f.format('sighash')).substring(0, 10))
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
