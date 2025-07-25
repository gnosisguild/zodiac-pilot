import { useState } from 'react'
import Select from 'react-select'
import { Input } from './Input'
import { InputLayout } from './InputLayout'
import {
  BaseOption,
  ClearIndicator,
  DropdownIndicator,
  SelectProps,
  selectStyles,
} from './Select'

export const MultiSelect = <Option extends BaseOption = BaseOption>({
  children,
  label,
  isDisabled,
  clearLabel,
  dropdownLabel,
  ...props
}: SelectProps<Option, false, true>) => {
  const [values, setValues] = useState<Option[]>([])

  return (
    <Input label={label} clearLabel={clearLabel} dropdownLabel={dropdownLabel}>
      {({ inputId }) => (
        <InputLayout disabled={isDisabled}>
          <Select<Option, true>
            {...props}
            unstyled
            isMulti
            inputId={inputId}
            isDisabled={isDisabled}
            classNames={selectStyles<Option, true>()}
            components={{ ClearIndicator, DropdownIndicator }}
          />
        </InputLayout>
      )}
    </Input>
  )
}
