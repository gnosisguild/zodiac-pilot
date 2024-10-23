import { CSSProperties } from 'react'
import BaseSelect, { Props } from 'react-select'

export const selectStyles = {
  control: (provided: CSSProperties, state: any) => ({
    ...provided,
    fontFamily: "'Roboto Mono', monospace",
    fontSize: '14px',
    borderRadius: 0,
    backgroundColor: 'rgba(217, 212, 173, 0.01)',
    borderColor: state.isFocused ? 'white' : 'rgba(217, 212, 173, 0.8)',
    boxShadow: 'none',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'white',
    },
  }),
  valueContainer: (provided: CSSProperties) => ({
    ...provided,
    padding: '0px 8px',
  }),
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
  return <BaseSelect {...props} styles={selectStyles as any} />
}
