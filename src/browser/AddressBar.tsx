import React from 'react'

import { pushLocation, useLocation } from '../location'
interface Props {
  onSubmit(location: string): void
}

const AddressBar: React.FC<Props> = ({ onSubmit }) => {
  const location = useLocation()
  return (
    <input
      type="text"
      defaultValue={location}
      key={location}
      onKeyPress={(ev) => {
        if (ev.key === 'Enter' && ev.target instanceof HTMLInputElement) {
          pushLocation(ev.target.value)
          onSubmit(ev.target.value)
        }
      }}
    />
  )
}

export default AddressBar
