import { RoleActionType } from '@zodiac/db/schema'
import { Select } from '@zodiac/ui'

export const RoleActionTypeSelect = () => {
  return (
    <Select
      isDisabled
      label="Type"
      options={[{ label: 'Swapper', value: RoleActionType.Swapper }]}
      defaultValue={RoleActionType.Swapper}
    />
  )
}
