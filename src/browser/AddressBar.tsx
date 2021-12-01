import React from 'react'

import { pushLocation, useLocation } from '../location'

const AddressBar: React.FC = () => {
  const location = useLocation()
  return (
    <input
      type="text"
      defaultValue={location}
      key={location}
      onKeyPress={(ev) => {
        if (ev.key === 'Enter' && ev.target instanceof HTMLInputElement) {
          pushLocation(ev.target.value)
        }
      }}
    />
  )
}

export default AddressBar
