import classNames from 'classnames'
import { ChevronDown, X } from 'lucide-react'
import { createContext, useContext, type ReactNode } from 'react'
import BaseSelect, {
  type ClassNamesConfig,
  type ClearIndicatorProps,
  type DropdownIndicatorProps,
  type GroupBase,
  type OptionProps,
  type Props,
} from 'react-select'
import Creatable, { type CreatableProps } from 'react-select/creatable'
import { GhostButton } from '../buttons'
import { Input, useClearLabel, useDropdownLabel } from './Input'
import { InputLayout, type InputLayoutProps } from './InputLayout'

const SelectContext = createContext({ inline: false })

const useInline = () => {
  const { inline } = useContext(SelectContext)

  return inline
}

type BaseOption = { label?: string; value: unknown }

type SelectStylesOptions = {
  inline?: boolean
}

export function selectStyles<Option extends BaseOption = BaseOption>({
  inline,
}: SelectStylesOptions = {}): ClassNamesConfig<
  Option,
  false,
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
    indicatorsContainer: () =>
      classNames('shrink-0 flex gap-1', !inline && 'mr-2'),
    indicatorSeparator: () => 'hidden',
    noOptionsMessage: () => 'p-4 italic opacity-75',
  }
}

type SelectBaseProps<Option extends BaseOption, Creatable extends boolean> = {
  label: string
  clearLabel?: string
  dropdownLabel?: string
  allowCreate?: Creatable
  inline?: boolean
  children?: OptionRenderProps<Option>
}

export type SelectProps<
  Option extends BaseOption,
  Creatable extends boolean,
> = Creatable extends true
  ? CreatableProps<Option, false, GroupBase<Option>> &
      SelectBaseProps<Option, Creatable>
  : Props<Option, false> & SelectBaseProps<Option, Creatable>

export function Select<
  Option extends BaseOption = BaseOption,
  Creatable extends boolean = false,
>({
  label,
  clearLabel,
  dropdownLabel,
  allowCreate,
  isDisabled,
  inline = false,
  children,
  ...props
}: SelectProps<Option, Creatable>) {
  const Component = allowCreate ? Creatable : BaseSelect
  const Layout = inline ? InlineLayout : InputLayout

  return (
    <SelectContext value={{ inline }}>
      <Input
        hideLabel={inline}
        label={label}
        clearLabel={clearLabel}
        dropdownLabel={dropdownLabel}
      >
        {({ inputId }) => (
          <Layout disabled={isDisabled}>
            <Component<Option>
              {...props}
              unstyled
              isDisabled={isDisabled}
              inputId={inputId}
              components={{
                ClearIndicator,
                DropdownIndicator,

                Option: createOptionRenderer<Option>(children),
                SingleValue: createOptionRenderer<Option>(children, {
                  isValue: true,
                }),
              }}
              classNames={selectStyles<Option>({ inline })}
            />
          </Layout>
        )}
      </Input>
    </SelectContext>
  )
}

function ClearIndicator({ clearValue }: ClearIndicatorProps) {
  return (
    <GhostButton iconOnly icon={X} size="small" onClick={clearValue}>
      {useClearLabel()}
    </GhostButton>
  )
}

Select.ClearIndicator = ClearIndicator

const DropdownIndicator = ({ isDisabled }: DropdownIndicatorProps) => (
  <GhostButton
    iconOnly
    disabled={isDisabled}
    icon={ChevronDown}
    size={useInline() ? 'tiny' : 'small'}
  >
    {useDropdownLabel()}
  </GhostButton>
)

Select.DropdownIndicator = DropdownIndicator

const InlineLayout = ({ children }: InputLayoutProps) => children

type OptionRenderProps<Option> = (props: OptionProps<Option>) => ReactNode
type CreateOptionRendererOptions = {
  isValue?: boolean
}

function createOptionRenderer<Option extends BaseOption>(
  children: OptionRenderProps<Option> | undefined,
  { isValue = false }: CreateOptionRendererOptions = {},
) {
  if (children == null) {
    return (props: OptionProps<Option>) => (
      <div
        {...props.innerProps}
        className={props.getClassNames('option', props)}
        style={isValue ? { gridArea: '1 / 1 / 2 / 3 ' } : {}}
      >
        {props.data.label}
      </div>
    )
  }

  return (props: OptionProps<Option>) => (
    <div
      {...props.innerProps}
      className={props.getClassNames('option', props)}
      style={isValue ? { gridArea: '1 / 1 / 2 / 3 ' } : {}}
    >
      {children(props)}
    </div>
  )
}
