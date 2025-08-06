import classNames from 'classnames'
import { ChevronDown, X } from 'lucide-react'
import { createContext, useContext } from 'react'
import BaseSelect, {
  type ClassNamesConfig,
  type ClearIndicatorProps,
  type DropdownIndicatorProps,
  type GroupBase,
  type Props,
} from 'react-select'
import Creatable, { type CreatableProps } from 'react-select/creatable'
import { GhostButton } from '../buttons'
import { Input, useClearLabel, useDropdownLabel } from './Input'
import { InputLayout, type InputLayoutProps } from './InputLayout'
import {
  BaseOption,
  OptionRenderProps,
  useOptionRenderer,
  useSingleValueRenderer,
} from './useOptionRenderer'

const SelectContext = createContext({ inline: false })

const useInline = () => {
  const { inline } = useContext(SelectContext)

  return inline
}

type SelectStylesOptions = {
  inline?: boolean
}

export function selectStyles<
  Option extends BaseOption = BaseOption,
  isMulti extends boolean = false,
>({ inline }: SelectStylesOptions = {}): ClassNamesConfig<
  Option,
  isMulti,
  GroupBase<Option>
> {
  return {
    control: () =>
      classNames(
        'flex items-center cursor-pointer !min-h-auto',
        inline ? 'text-xs rounded-md hover:bg-zinc-100/10' : 'text-sm',
      ),
    valueContainer: () => 'p-0',
    input: () => 'px-4 py-2 text-sm w-full overflow-hidden',
    clearIndicator: () =>
      'rounded-md shrink-0 hover:bg-zinc-200 text-zinc-500 dark:text-zinc-50 dark:hover:bg-zinc-700 self-center size-6 flex items-center justify-center',
    menu: () =>
      'bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-xs border border-zinc-300/50 dark:border-zinc-600/50 rounded-md mt-1 min-w-full !w-auto max-w-64 shadow-lg text-sm',
    placeholder: () =>
      classNames(
        'text-zinc-500 dark:text-zinc-400',
        inline ? 'py-1 px-2' : 'px-4 py-2',
      ),
    option: ({ isSelected }) =>
      classNames(
        'text-sm overflow-hidden',
        isSelected != null &&
          'hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 cursor-pointer',
        inline ? 'px-2 py-1 overflow-hidden' : 'px-4 py-2',
      ),
    singleValue: () => classNames('px-4'),
    indicatorsContainer: () =>
      classNames('shrink-0 flex gap-1', !inline && 'mr-2'),
    indicatorSeparator: () => 'hidden',
    noOptionsMessage: () => 'p-4 italic opacity-75',
  }
}

type SelectBaseProps<
  Option extends BaseOption,
  isMulti extends boolean,
  Creatable extends boolean,
> = {
  label: string
  hideLabel?: boolean
  clearLabel?: string
  dropdownLabel?: string
  allowCreate?: Creatable
  inline?: boolean
  children?: OptionRenderProps<Option, isMulti>
}

export type SelectProps<
  Option extends BaseOption,
  Creatable extends boolean,
  isMulti extends boolean = false,
> = Creatable extends true
  ? CreatableProps<Option, isMulti, GroupBase<Option>> &
      SelectBaseProps<Option, isMulti, Creatable>
  : Props<Option, isMulti> & SelectBaseProps<Option, isMulti, Creatable>

export function Select<
  Option extends BaseOption = BaseOption,
  Creatable extends boolean = false,
>({
  label,
  clearLabel,
  hideLabel = false,
  dropdownLabel,
  allowCreate,
  isDisabled,
  inline = false,
  children,
  ...props
}: SelectProps<Option, Creatable, false>) {
  const Component = allowCreate ? Creatable : BaseSelect
  const Layout = inline ? InlineLayout : InputLayout

  const Option = useOptionRenderer<Option, false>(children)
  const SingleValue = useSingleValueRenderer<Option, false>(children)

  return (
    <SelectContext value={{ inline }}>
      <Input
        hideLabel={hideLabel || inline}
        label={label}
        clearLabel={clearLabel}
        dropdownLabel={dropdownLabel}
      >
        {({ inputId }) => (
          <Layout disabled={isDisabled}>
            <Component<Option, false>
              {...props}
              unstyled
              isDisabled={isDisabled}
              inputId={inputId}
              components={{
                ClearIndicator,
                DropdownIndicator,

                Option,
                SingleValue,
              }}
              classNames={selectStyles<Option>({ inline })}
            />
          </Layout>
        )}
      </Input>
    </SelectContext>
  )
}

export function ClearIndicator<Option, isMulti extends boolean = false>({
  clearValue,
}: ClearIndicatorProps<Option, isMulti>) {
  return (
    <GhostButton iconOnly icon={X} size="small" onClick={clearValue}>
      {useClearLabel()}
    </GhostButton>
  )
}

Select.ClearIndicator = ClearIndicator

export function DropdownIndicator<Option, isMulti extends boolean = false>({
  isDisabled,
}: DropdownIndicatorProps<Option, isMulti>) {
  return (
    <GhostButton
      iconOnly
      disabled={isDisabled}
      icon={ChevronDown}
      size={useInline() ? 'tiny' : 'small'}
    >
      {useDropdownLabel()}
    </GhostButton>
  )
}

Select.DropdownIndicator = DropdownIndicator

const InlineLayout = ({ children }: InputLayoutProps) => children
