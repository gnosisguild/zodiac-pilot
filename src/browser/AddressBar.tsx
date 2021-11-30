import React from 'react'

import { updateLocation, useLocation } from '../location'

const AddressBar: React.FC = () => {
  const location = useLocation()
  return (
    <input
      type="text"
      defaultValue={location}
      key={location}
      onKeyPress={(ev) => {
        if (ev.key === 'Enter' && ev.target instanceof HTMLInputElement) {
          updateLocation(ev.target.value)
        }
      }}
    />
  )
}

export default AddressBar
