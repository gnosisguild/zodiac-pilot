import {
  ZODIAC_MODULE_NAMES,
  type SupportedModuleType,
  type ZodiacModule,
} from '@zodiac/modules'
import type { ExecutionRoute, HexAddress } from '@zodiac/schema'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { splitPrefixedAddress, type PrefixedAddress } from 'ser-kit'
import { ModSelect, NO_MODULE_OPTION } from './ModSelect'
import { useSafeDelegates } from './useSafeDelegates'

type Value = {
  moduleType: SupportedModuleType
  moduleAddress: string
}

type ZodiacModProps = {
  avatarAddress: PrefixedAddress
  pilotAddress: HexAddress
  route: ExecutionRoute
  modules: ZodiacModule[]
  disabled?: boolean
  value: Value | null

  onSelect: (value: Value | null) => void
}

export const ZodiacMod = ({
  avatarAddress,
  pilotAddress,
  value,
  route,
  modules,
  disabled,
  onSelect,
}: ZodiacModProps) => {
  const { load: loadSafes, data: safes = [] } = useFetcher<string[]>({
    key: 'available-safes',
  })
  const [chainId] = splitPrefixedAddress(avatarAddress)

  useEffect(() => {
    loadSafes(`/${pilotAddress}/${chainId}/available-safes`)
  }, [chainId, loadSafes, pilotAddress])

  const { delegates } = useSafeDelegates(route, avatarAddress)

  const pilotIsOwner = safes.some(
    (safe) => safe.toLowerCase() === avatarAddress.toLowerCase(),
  )
  const pilotIsDelegate = delegates.some(
    (delegate) => delegate.toLowerCase() === pilotAddress.toLowerCase(),
  )
  const defaultModOption =
    pilotIsOwner || pilotIsDelegate ? NO_MODULE_OPTION : undefined

  return (
    <div className="flex flex-col gap-4">
      <ModSelect
        isMulti={false}
        label="Zodiac Mod"
        options={[
          ...(pilotIsOwner || pilotIsDelegate ? [NO_MODULE_OPTION] : []),
          ...modules.map((mod) => ({
            value: mod.moduleAddress,
            label: ZODIAC_MODULE_NAMES[mod.type],
          })),
        ]}
        onChange={async (selected) => {
          if (selected == null) {
            onSelect(null)

            return
          }

          const module = modules.find(
            ({ moduleAddress }) => moduleAddress === selected.value,
          )

          if (module == null) {
            onSelect(null)

            return
          }

          onSelect({
            moduleAddress: module.moduleAddress,
            moduleType: module.type,
          })
        }}
        value={
          value
            ? {
                value: value.moduleAddress,
                label: ZODIAC_MODULE_NAMES[value.moduleType],
              }
            : defaultModOption != null
              ? defaultModOption
              : null
        }
        isDisabled={disabled}
        placeholder="Select a module"
        avatarAddress={avatarAddress}
      />
    </div>
  )
}
