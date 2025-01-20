import { ChevronDown, X } from 'lucide-react'
import BaseSelect, {
  type ClassNamesConfig,
  type CommonProps,
  type GroupBase,
  type Props,
} from 'react-select'
import Creatable, { type CreatableProps } from 'react-select/creatable'
import { GhostButton } from '../buttons'
import { Input, useClearLabel, useDropdownLabel } from './Input'

export const selectStyles = <
  Option = unknown,
  Multi extends boolean = boolean,
>(): ClassNamesConfig<Option, Multi, GroupBase<Option>> => ({
  control: () => 'flex items-center text-sm cursor-pointer',
  valueContainer: () => 'px-4',
  dropdownIndicator: () =>
    'rounded-md flex-shrink-0 hover:bg-zinc-200 text-zinc-500 dark:text-zinc-50 dark:hover:bg-zinc-700 self-center size-6 flex items-center justify-center',
  clearIndicator: () =>
    'rounded-md flex-shrink-0 hover:bg-zinc-200 text-zinc-500 dark:text-zinc-50 dark:hover:bg-zinc-700 self-center size-6 flex items-center justify-center',
  menu: () =>
    'bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur border border-zinc-300/50 dark:border-zinc-600/50 rounded-md mt-1 shadow-lg text-sm',
  placeholder: () => 'text-zinc-500 dark:text-zinc-400 py-2',
  option: () =>
    'text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 px-4 cursor-pointer',
  indicatorsContainer: () => 'flex-shrink-0 flex gap-1 mr-2',
  indicatorSeparator: () => 'hidden',
  noOptionsMessage: () => 'p-4 italic opacity-75',
})

type SelectBaseProps<Creatable extends boolean> = {
  label: string
  clearLabel?: string
  dropdownLabel?: string
  allowCreate?: Creatable
}

export type SelectProps<
  Creatable extends boolean,
  Option,
  Multi extends boolean,
> = Creatable extends true
  ? CreatableProps<Option, Multi, GroupBase<Option>> &
      SelectBaseProps<Creatable>
  : Props<Option, Multi> & SelectBaseProps<Creatable>

export function Select<
  Creatable extends boolean = false,
  Option = unknown,
  Multi extends boolean = boolean,
>({
  label,
  clearLabel,
  dropdownLabel,
  allowCreate,
  isDisabled,
  ...props
}: SelectProps<Creatable, Option, Multi>) {
  const Component = allowCreate ? Creatable : BaseSelect

  return (
    <Input
      label={label}
      clearLabel={clearLabel}
      dropdownLabel={dropdownLabel}
      disabled={isDisabled}
    >
      {({ inputId }) => (
        <Component
          {...props}
          unstyled
          isDisabled={isDisabled}
          inputId={inputId}
          components={{
            ClearIndicator: ClearIndicator<Option, Multi>,
            DropdownIndicator,
          }}
          classNames={selectStyles<Option, Multi>()}
        />
      )}
    </Input>
  )
}

function ClearIndicator<Option, IsMulti extends boolean>({
  clearValue,
}: CommonProps<Option, IsMulti, GroupBase<Option>>) {
  return (
    <GhostButton iconOnly icon={X} size="small" onClick={clearValue}>
      {useClearLabel()}
    </GhostButton>
  )
}

Select.ClearIndicator = ClearIndicator

const DropdownIndicator = () => (
  <GhostButton iconOnly icon={ChevronDown} size="small">
    {useDropdownLabel()}
  </GhostButton>
)

Select.DropdownIndicator = DropdownIndicator
