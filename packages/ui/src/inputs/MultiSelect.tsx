import { Trash2 } from 'lucide-react'
import Select, { components, ContainerProps } from 'react-select'
import { GhostButton } from '../buttons'
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
  label,
  isDisabled,
  clearLabel,
  dropdownLabel,
  ...props
}: SelectProps<Option, false, true>) => {
  return (
    <Input label={label} clearLabel={clearLabel} dropdownLabel={dropdownLabel}>
      {({ inputId }) => (
        <Select<Option, true>
          {...props}
          unstyled
          isMulti
          inputId={inputId}
          isDisabled={isDisabled}
          controlShouldRenderValue={false}
          classNames={selectStyles<Option, true>()}
          components={{
            ClearIndicator,
            DropdownIndicator,
            SelectContainer: SelectInput,
          }}
        />
      )}
    </Input>
  )
}

function SelectInput<Option extends BaseOption>({
  children,
  isDisabled,
  getValue,
  setValue,
  ...props
}: ContainerProps<Option, true>) {
  const values = getValue()

  return (
    <components.SelectContainer
      {...props}
      isDisabled={isDisabled}
      getValue={getValue}
      setValue={setValue}
    >
      {values.length > 0 && (
        <ul className="mb-2 flex flex-col gap-1 text-sm">
          {values.map((value) => (
            <li className="flex items-center justify-between">
              {value.label}
              <GhostButton
                iconOnly
                size="tiny"
                onClick={() =>
                  setValue(
                    values.filter((currentValue) => currentValue !== value),
                    'deselect-option',
                    value,
                  )
                }
                icon={Trash2}
              >
                Remove
              </GhostButton>
            </li>
          ))}
        </ul>
      )}

      <InputLayout disabled={isDisabled}>{children}</InputLayout>
    </components.SelectContainer>
  )
}
