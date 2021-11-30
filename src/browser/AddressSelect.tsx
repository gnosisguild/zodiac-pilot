import React from 'react'

type Props = {
  label: string
  options: string[]
  value: string
  onChange(value: string): void
}

const AddressSelect: React.FC<Props> = ({
  label,
  options,
  value,
  onChange,
}) => (
  <>
    <label>
      <span>{label}</span>
      <select
        onChange={(a) => {
          onChange(a.target.value)
        }}
        value={value}
      >
        {[options.map((value) => <option key={value}>{value}</option>)]}
      </select>
    </label>
  </>
)

//  onChange={(selected: { value: string; label: string }) => {onChange((selected.value)}}

export default AddressSelect
