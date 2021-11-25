import React from 'react'

type Props = {
  value: string
  onChange(value: string): void
}

const Target: React.FC<Props> = ({ value, onChange }) => {
  return (
    <>
      <label htmlFor="target-avatar"> Target Avatar </label>
      <input
        id="target-avatar"
        type="text"
        value={value}
        onChange={(ev) => {
          onChange(ev.target.value)
        }}
      />
    </>
  )
}

export default Target
