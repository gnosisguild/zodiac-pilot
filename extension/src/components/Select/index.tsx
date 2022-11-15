import * as React from 'react'
import Select, { Props } from 'react-select'

const customStyles = {
  control: (provided: React.CSSProperties, state: any) => ({
    ...provided,
    fontFamily: "'Roboto Mono', monospace",
    fontSize: '14px',
    borderRadius: 0,
    background: 'rgba(217, 212, 173, 0.01)',
    borderColor: state.isFocused ? 'white' : 'rgba(217, 212, 173, 0.8)',
    boxShadow: 'none',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'white',
    },
  }),
  valueContainer: (provided: React.CSSProperties) => ({
    ...provided,
    padding: '0px 8px',
  }),
  input: (provided: React.CSSProperties) => ({
    ...provided,
    margin: 0,
    paddingBottom: 0,
    paddingTop: 0,
  }),
  option: (provided: React.CSSProperties, state: any) => ({
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
  menu: (provided: React.CSSProperties) => ({
    ...provided,
    zIndex: 10,
    borderRadius: 0,
    background: 'rgb(29 27 14 / 70%)',
  }),
  singleValue: (provided: React.CSSProperties) => ({
    ...provided,
    color: 'white',
  }),
}

const StyledSelect: React.FC<Props> = (props) => {
  return <Select {...props} styles={customStyles as any} />
}

export default StyledSelect
