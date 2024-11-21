import { CSSProperties } from 'react'
import BaseSelect, { Props } from 'react-select'

export const selectStyles = {
  input: (provided: CSSProperties) => ({
    ...provided,
    color: 'white',
    margin: 0,
    paddingBottom: 0,
    paddingTop: 0,
  }),
  option: (provided: CSSProperties, state: any) => ({
    ...provided,
    background: state.isSelected
      ? 'rgba(217, 212, 173, 0.2)'
      : 'rgba(217, 212, 173, 0.2)',
    color: 'white',
    fontFamily: "'Roboto Mono', monospace",
    fontSize: '14px',
    cursor: 'pointer',
    '&:hover': {
      background: 'rgba(217, 212, 173, 0.1)',
    },
  }),
  menu: (provided: CSSProperties) => ({
    ...provided,
    zIndex: 10,
    borderRadius: 0,
    background: 'rgb(0 0 0 / 95%)',
    marginTop: 0,
  }),
  menuList: (provided: CSSProperties) => ({
    ...provided,
    padding: 0,
  }),
  singleValue: (provided: CSSProperties) => ({
    ...provided,
    color: 'white',
  }),
}

export function Select<Option = unknown, Multi extends boolean = boolean>(
  props: Props<Option, Multi>
) {
  return (
    <BaseSelect
      {...props}
      unstyled
      classNames={{
        control: () =>
          'rounded-md border border-zinc-600 text-sm bg-zinc-800 hover:border-zinc-500 cursor-pointer',
        valueContainer: () => 'px-4',
        dropdownIndicator: () => 'px-2',
        menu: () =>
          'bg-zinc-800 border-zinc-600 rounded-md mt-1 shadow-md text-sm overflow-hidden',
        placeholder: () => 'placeholder:text-zinc-500',
        option: () => 'text-sm hover:bg-zinc-700 px-4 cursor-pointer',
      }}
    />
  )
}
