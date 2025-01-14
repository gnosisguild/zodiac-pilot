import {
  SupportedZodiacModuleType,
  ZODIAC_MODULE_NAMES,
  type ZodiacModule,
} from '@zodiac/modules'
import type { HexAddress } from '@zodiac/schema'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { splitPrefixedAddress, type PrefixedAddress } from 'ser-kit'
import { ModSelect, NO_MODULE_OPTION } from './ModSelect'

type Value = {
  moduleType: SupportedZodiacModuleType
  moduleAddress: string
}

type ZodiacModProps = {
  avatar: PrefixedAddress
  pilotAddress: HexAddress | null
  disabled?: boolean
  value: HexAddress | null

  onSelect: (value: Value | null) => void
}

export const ZodiacMod = ({
  avatar,
  pilotAddress,
  value,
  disabled,
  onSelect,
}: ZodiacModProps) => {
  const { load: loadSafes, data: safes = [] } = useFetcher<string[]>({
    key: 'available-safes',
  })
  const { load: loadDelegates, data: delegates = [] } = useFetcher<string[]>({
    key: 'delegates',
  })
  const { load: loadModules, data: modules = [] } = useFetcher<ZodiacModule[]>({
    key: 'modules',
  })
  const [chainId] = splitPrefixedAddress(avatar)

  useEffect(() => {
    if (pilotAddress == null) {
      return
    }

    loadSafes(`/${pilotAddress}/${chainId}/available-safes`)
    loadDelegates(`/${pilotAddress}/${chainId}/delegates`)
  }, [chainId, loadDelegates, loadSafes, pilotAddress])

  useEffect(() => {
    const [, address] = splitPrefixedAddress(avatar)

    loadModules(`/${address}/${chainId}/modules`)
  }, [avatar, chainId, loadModules])

  const pilotIsOwner = safes.some(
    (safe) => safe.toLowerCase() === avatar.toLowerCase(),
  )
  const pilotIsDelegate =
    pilotAddress != null &&
    delegates.some(
      (delegate) => delegate.toLowerCase() === pilotAddress.toLowerCase(),
    )
  const defaultModOption =
    pilotIsOwner || pilotIsDelegate ? NO_MODULE_OPTION : undefined

  const selectedModule = modules.find(
    (module) => module.moduleAddress === value,
  )

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
          selectedModule != null
            ? {
                value: selectedModule.moduleAddress,
                label: ZODIAC_MODULE_NAMES[selectedModule.type],
              }
            : defaultModOption != null
              ? defaultModOption
              : null
        }
        isDisabled={disabled}
        placeholder="Select a module"
        avatarAddress={avatar}
      />
    </div>
  )
}
