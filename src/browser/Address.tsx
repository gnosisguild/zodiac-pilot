import React from 'react'

type Props = {
  label: string
  value: string
  onChange(value: string): void
}

const Address: React.FC<Props> = ({ label, value, onChange }) => {
  return (
    <>
      <label>
        <span>{label}</span>
        <input
          type="text"
          value={value}
          onChange={(ev) => {
            onChange(ev.target.value)
          }}
        />
      </label>
    </>
  )
}

export default Address
