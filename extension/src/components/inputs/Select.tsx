import BaseSelect, { Props } from 'react-select'

export const selectStyles = {
  control: () =>
    'rounded-md border flex items-center border-zinc-600 text-sm bg-zinc-800 hover:border-zinc-500 cursor-pointer',
  valueContainer: () => 'px-4',
  dropdownIndicator: () => 'px-2',
  menu: () =>
    'bg-zinc-800/80 backdrop-blur border border-zinc-600/50 rounded-md mt-1 shadow-lg text-sm',
  placeholder: () => 'text-zinc-400 py-2',
  option: () => 'text-sm hover:bg-zinc-700 px-4 cursor-pointer',
  indicatorsContainer: () =>
    'rounded-md hover:bg-zinc-700 self-center size-6 my-1 mr-2 flex items-center justify-center',
  noOptionsMessage: () => 'p-4 italic opacity-75',
}

export function Select<Option = unknown, Multi extends boolean = boolean>(
  props: Props<Option, Multi>
) {
  return <BaseSelect {...props} unstyled classNames={selectStyles} />
}
