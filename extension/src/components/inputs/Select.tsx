import BaseSelect, { ClassNamesConfig, GroupBase, Props } from 'react-select'
import { Input } from './Input'

export const selectStyles = <
  Option = unknown,
  Multi extends boolean = boolean,
>(): ClassNamesConfig<Option, Multi, GroupBase<Option>> => ({
  control: () =>
    'rounded-md border flex items-center bg-zinc-100 shadow-sm border-zinc-300 dark:border-zinc-600 text-sm dark:bg-zinc-800 dark:hover:border-zinc-500 cursor-pointer',
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

export function Select<Option = unknown, Multi extends boolean = boolean>({
  label,
  ...props
}: Props<Option, Multi> & { label: string }) {
  return (
    <Input label={label}>
      {({ inputId }) => (
        <BaseSelect
          {...props}
          unstyled
          inputId={inputId}
          classNames={selectStyles<Option, Multi>()}
        />
      )}
    </Input>
  )
}
