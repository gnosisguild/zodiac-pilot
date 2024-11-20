import { Warning } from '@/components'
import { MODULE_NAMES } from '../../../const'
import { useSafeDelegates, useSafesWithOwner } from '../../integrations/safe'
import { SupportedModuleType } from '../../integrations/zodiac/types'
import { useZodiacModules } from '../../integrations/zodiac/useZodiacModules'
import { ModSelect, NO_MODULE_OPTION } from './ModSelect'
import { useRouteId } from './useRouteId'

type Value = {
  moduleType: SupportedModuleType
  moduleAddress: string
}

type ZodiacModProps = {
  avatarAddress: string
  pilotAddress: string

  value: Value | null

  onSelect: (value: Value | null) => void
}

export const ZodiacMod = ({
  avatarAddress,
  pilotAddress,
  value,
  onSelect,
}: ZodiacModProps) => {
  const routeId = useRouteId()
  const {
    loading: loadingMods,
    isValidSafe,
    modules,
  } = useZodiacModules(avatarAddress, routeId)

  const { safes } = useSafesWithOwner(pilotAddress, routeId)
  const { delegates } = useSafeDelegates(avatarAddress, routeId)

  const pilotIsOwner = safes.some(
    (safe) => safe.toLowerCase() === avatarAddress.toLowerCase()
  )
  const pilotIsDelegate = delegates.some(
    (delegate) => delegate.toLowerCase() === pilotAddress.toLowerCase()
  )
  const defaultModOption =
    pilotIsOwner || pilotIsDelegate ? NO_MODULE_OPTION : undefined

  return (
    <div className="flex flex-col gap-4">
      {!isValidSafe && (
        <Warning title="Selected safe is not valid">
          Please select a valid safe to be able to select a mod.
        </Warning>
      )}

      <ModSelect
        isMulti={false}
        // disabled={modules.length === 0}
        options={[
          ...(pilotIsOwner || pilotIsDelegate ? [NO_MODULE_OPTION] : []),
          ...modules.map((mod) => ({
            value: mod.moduleAddress,
            label: `${MODULE_NAMES[mod.type]} Mod`,
          })),
        ]}
        onChange={async (selected) => {
          if (selected == null) {
            onSelect(null)

            return
          }

          const module = modules.find(
            ({ moduleAddress }) => moduleAddress === selected.value
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
                label: MODULE_NAMES[value.moduleType],
              }
            : defaultModOption
        }
        isDisabled={loadingMods || !isValidSafe}
        placeholder={
          loadingMods
            ? 'Loading modules...'
            : isValidSafe
              ? 'Select a module'
              : ''
        }
        avatarAddress={avatarAddress}
      />
    </div>
  )
}