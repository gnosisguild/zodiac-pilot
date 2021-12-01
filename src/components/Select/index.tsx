import * as React from 'react'
import Select from 'react-select'

const StyledSelect = (props: any) => {
  const customStyles = {
    control: (provided: React.CSSProperties, state: any) => ({
      ...provided,
      borderRadius: 0,
      background: 'rgba(217, 212, 173, 0.01)',
      borderColor: state.isFocused ? 'rgba(217, 212, 173, 1)' : 'white',
      boxShadow: 'none',
      cursor: 'pointer',
      '&:hover': {
        borderColor: 'rgba(217, 212, 173, 1)',
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
      background: state.isSelected ? 'rgba(217, 212, 173, 0.5)' : 'none',
      color: 'white',
      cursor: 'pointer',
      '&:hover': {
        background: 'rgba(217, 212, 173, 0.2)',
      },
    }),
    menu: (provided: React.CSSProperties) => ({
      ...provided,
      zIndex: 10,
      borderRadius: 0,
      background: 'black',
    }),
    singleValue: (provided: React.CSSProperties) => ({
      ...provided,
      color: 'white',
    }),
  }

  return <Select {...props} styles={customStyles} />
}

export default StyledSelect
