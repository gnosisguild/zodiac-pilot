import classNames from 'classnames'
import { X } from 'lucide-react'
import Select, {
  ClassNamesConfig,
  components,
  ContainerProps,
  GroupBase,
} from 'react-select'
import { GhostButton } from '../buttons'
import { Input } from './Input'
import { InputLayout } from './InputLayout'
import {
  selectStyles as baseSelectStyles,
  ClearIndicator,
  DropdownIndicator,
  SelectProps,
} from './Select'
import {
  BaseOption,
  useOptionRenderer,
  useSingleValueRenderer,
} from './useOptionRenderer'

function selectStyles<Option extends BaseOption>(): ClassNamesConfig<
  Option,
  true,
  GroupBase<Option>
> {
  return {
    ...baseSelectStyles(),
    singleValue: () => classNames('py-2 flex-1 overflow-hidden'),
  }
}

export const MultiSelect = <Value extends string | number>({
  label,
  isDisabled,
  clearLabel,
  dropdownLabel,
  children,
  description,
  required = false,
  ...props
}: SelectProps<BaseOption<Value>, false, true>) => {
  const Option = useOptionRenderer<BaseOption<Value>, true>(children)
  const SingleValue = useSingleValueRenderer<BaseOption<Value>, true>(children)

  return (
    <Input
      label={label}
      clearLabel={clearLabel}
      dropdownLabel={dropdownLabel}
      description={description}
      required={required}
    >
      {({ inputId }) => (
        <Select<BaseOption<Value>, true>
          {...props}
          unstyled
          isMulti
          required={required}
          isClearable={false}
          inputId={inputId}
          isDisabled={isDisabled}
          controlShouldRenderValue={false}
          classNames={selectStyles<BaseOption<Value>>()}
          components={{
            ClearIndicator,
            DropdownIndicator,
            SelectContainer,
            Option,
            SingleValue,
          }}
        />
      )}
    </Input>
  )
}

function SelectContainer<Option extends BaseOption>({
  children,
  isDisabled,
  getValue,
  setValue,
  selectProps,

  ...props
}: ContainerProps<Option, true>) {
  const values = getValue()

  return (
    <components.SelectContainer
      {...props}
      isDisabled={isDisabled}
      selectProps={selectProps}
      getValue={getValue}
      setValue={setValue}
    >
      {values.length > 0 && (
        <ul className="-mb-1 flex flex-col divide-y divide-zinc-300 rounded-t border border-zinc-300 bg-zinc-50 pb-2 pl-4 pr-2 pt-1 text-sm dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-950">
          {values.map((value) => (
            <li
              className="flex items-center justify-between gap-2"
              key={value.value}
            >
              {selectProps.components.SingleValue && (
                <selectProps.components.SingleValue
                  {...props}
                  data={value}
                  getValue={getValue}
                  setValue={setValue}
                  selectProps={selectProps}
                  isDisabled={isDisabled}
                  children={children}
                />
              )}

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
                icon={X}
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
