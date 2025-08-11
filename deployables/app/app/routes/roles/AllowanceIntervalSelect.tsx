import { AllowanceInterval } from '@zodiac/schema'
import { Select } from '@zodiac/ui'
import { ComponentProps } from 'react'

export const AllowanceIntervalSelect = (
  props: Omit<ComponentProps<typeof Select>, 'options' | 'isClearable'>,
) => (
  <Select
    defaultValue={{ label: 'Monthly', value: AllowanceInterval.Monthly }}
    {...props}
    isClearable={false}
    options={[
      { label: 'Daily', value: AllowanceInterval.Daily },
      { label: 'Weekly', value: AllowanceInterval.Weekly },
      { label: 'Monthly', value: AllowanceInterval.Monthly },
      { label: 'Quarterly', value: AllowanceInterval.Quarterly },
      { label: 'Yearly', value: AllowanceInterval.Yearly },
    ]}
  />
)
